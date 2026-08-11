# Ratchet source audit recommendations

Audit date: 2026-08-09

## Scope and verification

This review covered the repository configuration and all source trees under `modules/*/src`, including tests and generated sources. Generated Brevo and Sobol clients were scanned for integration and maintenance problems but are called out separately because fixes should normally be made in their generators. Findings are grouped alphabetically by module and, within each module, ordered `Crit`, `High`, `Med`, `Low`, then `Optional`.

Verification performed:

- `pnpm build` passed for all 15 workspace projects.
- `pnpm test` passed, but many security-, database-, Angular-, and AWS-facing suites are skipped; `passWithNoTests` also allows an untested package to pass.
- `pnpm lint` cannot start because `typescript-eslint@8.65.0` rejects the installed `typescript@7.0.2`.

Severity meanings: **Crit** can directly cause broad data loss, authentication bypass, or loss of transactional integrity; **High** is a likely security, correctness, or reliability failure with substantial impact; **Med** is a contained defect or meaningful maintainability risk; **Low** is a smaller edge case or quality defect; **Optional** is hardening or cleanup.

## Repository-wide

### High

- **Declared Node support is not real.** The root `package.json` declares Node `>=14.18`, while installed core tooling requires modern Node (`eslint@10.8.0` requires `^20.19 || ^22.13 || >=24`; Vite 7 and Vitest 4 require Node 20+). A consumer or CI job honoring the declared range can install an unusable toolchain. Raise the engine floor and enforce it in CI.
- **The lint gate is completely inoperative.** `package.json` combines TypeScript 7.0.2 with `typescript-eslint` 8.65.0, which exits before linting any file. Pin a supported TypeScript release or upgrade `typescript-eslint` when TS 7 support exists, then make lint a required CI check.

### Med

- **The project is only partially strict.** `tsconfig.json:16-19` disables `noImplicitAny`, `noUnusedLocals`, `noImplicitThis`, and `strictNullChecks` despite `strict: true`. Many null dereferences found below compile only because of these overrides. Restore the flags incrementally per module.
- **Test source is excluded from type-checking.** `tsconfig.json:31` excludes every `*.spec.ts`, allowing broken imports/types in tests to go unnoticed unless Vitest happens to load the file. Add a test tsconfig or include tests in a no-emit type-check.
- **The test configuration can report success without meaningful coverage.** `vitest.config.mts:12-25` enables `passWithNoTests` and sets every coverage threshold to zero. Core GraphQL, Angular, ECR cleanup, and database integration behaviors are wholly or largely skipped. Require tests per published module and establish non-zero thresholds.

### Low

- **The ESLint config contains a likely misspelled/nonexistent rule.** `eslint.config.mjs:15` configures `@typescript-eslint/no-re`; after the TypeScript incompatibility is fixed, this is likely to become the next configuration error. It appears intended to be a different rule.
- **Repository instructions and the actual toolchain disagree.** `AGENTS.md` describes Yarn 4 commands while `package.json` and the lockfile use pnpm 11. Update the contributor documentation so local and CI behavior match.

## acute-common

### High

- **Persistent application data is logged verbatim.** `modules/acute-common/src/services/local-storage.service.ts:94` logs the full JSON value being stored; consumers can put JWTs, identity data, or application secrets there. Log only the key and size, with values redacted.

### Med

- **Signal updates reuse the same object reference.** `modules/acute-common/src/services/process-monitor/process-monitor-service.ts:123-138` mutates the current process object and calls `signal.set()` with that same object. Angular signals use equality checks, so label/detail/percentage changes may not notify subscribers. Replace the object immutably.
- **Fire-and-forget process operations can produce unhandled rejections.** `process-monitor.service.ts:61-73` uses `.then(No.op)` without a rejection handler. Either await/return the operation or add an explicit catch path.
- **The order-by pipe mutates component-owned arrays.** `modules/acute-common/src/pipes/order-by.pipe.ts:19-56` calls `sort()` on the input and is marked impure, producing side effects and repeated work during change detection. Sort a copy and keep the pipe pure when possible.
- **Angular behavior has no active automated coverage.** All acute-common tests are skipped because the Angular test environment in `vitest.config.mts` is disabled. The signal notification defect above is exactly the kind of regression this leaves undetected.

### Low

- **Corrupt local storage can break reads/application startup.** `local-storage.service.ts:103-107` calls `JSON.parse` without recovery or eviction. Catch parse failures and remove or quarantine the bad value.
- **A public pipe selector is misspelled.** `order-by.pipe.ts:3` exports `ngxAcuteOderBy`, cementing a typo into templates. Add the correctly spelled alias and deprecate the old name.
- **GraphQL log format strings do not match their arguments.** `modules/acute-common/src/services/graphql-query.service.ts:40,67` provide more placeholders than values, obscuring useful failure diagnostics.
- **CSS numeric conversion truncates valid decimals.** `modules/acute-common/src/services/css-theme.service.ts:73` strips suffixes and uses integer parsing, so fractional pixel/rem values are lost. Use `parseFloat` and validate the complete unit.

## acute-warden

### Crit

- **Magic-link codes and resulting JWTs are written to logs.** `modules/acute-warden/src/components/acute-magic-lander/acute-magic-lander.component.ts:42,57` logs the code, encoded/decoded metadata, and login result; `modules/acute-warden/src/services/warden-adapter.service.ts:65` logs the complete magic URL. Anyone with log access can authenticate as the user. Remove these logs and rotate any credentials retained by existing logs.

### High

- **OTP values are logged during interactive login.** `modules/acute-warden/src/components/acute-login/acute-login.component.ts:223` logs the supplied verification code. Redact all authentication factors.
- **WebAuthn export material is logged.** `modules/acute-warden/src/components/acute-user-profile/acute-user-profile.component.ts:89-92` logs the export token used to transfer an authenticator. Treat it like a credential.
- **Route/query logging can capture magic-link secrets.** `modules/acute-warden/src/guards/not-logged-in-guard.ts:24` logs the entire query map. Log only route names or an allowlisted set of non-sensitive parameters.

### Med

- **The create-account form always applies an email validator.** `modules/acute-warden/src/components/acute-create-user/acute-create-user.component.ts:51` keeps email validation even when the selected contact type is phone, preventing valid phone-based account creation.
- **Magic-link errors are displayed raw.** `acute-magic-lander.component.ts:60` exposes the caught error string to the user, which can reveal server/internal details. Map failures to stable user-facing messages and log a redacted correlation ID.
- **Profile subscriptions are not released.** `acute-user-profile.component.ts:35-37` subscribes in the constructor without `takeUntilDestroyed`/unsubscribe, leaking the component and duplicating reactions after recreation.
- **The only acute-warden test is skipped.** Authentication UI behavior therefore has no active regression coverage.

### Low

- **OTP length is hard-coded to six.** `acute-login.component.ts` assumes six characters even though the server/provider configuration can differ. Return expected length with the challenge or expose it through configuration.
- **Several navigation/login promises are discarded with `.then(No.op)`.** Failures can become unhandled and leave the UI in an indeterminate state; await them or handle rejection.
- **The profile template declares `icon` twice on one button.** `modules/acute-warden/src/components/acute-user-profile/acute-user-profile.component.html:28` contains duplicate attributes, so one value is discarded and template intent is ambiguous.

## aws

### Crit

- **The ECR cleaner ignores every documented deletion safety control.** `modules/aws/src/ecr/ecr-unused-image-cleaner-options.ts:7-8` defines `repositoriesToPurge` and `minimumAgeInDays`, and `ecr-unused-image-cleaner.ts:29-32` defines minimum-age/count constants, but `performCleaning`/`cleanRepository` at `:58-123` processes every repository and deletes every image whose tag is not globally observed as in use. A normal invocation can mass-delete recent or protected images. Enforce repository allowlisting, age/count retention, dry-run-by-default, and fail closed before issuing deletes.

### High

- **DynamoDB batch-get never retries unprocessed keys.** `modules/aws/src/dynamodb/dynamo-ratchet.ts:451-465` loops on `!input.RequestItems && input.RequestItems[tableName]...`; after assigning `UnprocessedKeys`, the condition is false, while a null value would be dereferenced. Callers silently receive incomplete results. Loop while the table has remaining keys and add bounded backoff.
- **Security codes use `Math.random()`.** `modules/aws/src/expiring-code/expiring-code-ratchet.ts:21-23` generates login/one-time codes from a non-cryptographic PRNG. Use `crypto.randomInt`/Web Crypto rejection sampling and validate alphabet/length/TTL.
- **ECR deletes are not chunked to the API limit.** `ecr-unused-image-cleaner.ts:107-123` sends all accumulated image IDs in one `BatchDeleteImage` call; ECR accepts at most 100. Large repositories fail to clean and may be left in a partially reasoned state. Chunk and inspect per-image failures.
- **Untagged ECR images can abort a repository cleanup.** `ecr-unused-image-cleaner.ts:93` calls `imageTags.includes(...)` although `imageTags` is optional. Treat untagged images explicitly and apply the same retention policy.
- **Configuration secrets are printed when JSON is malformed.** `modules/aws/src/environment/env-var-environment-service-provider.ts:27-28` and `ssm-environment-service-provider.ts:61-63` log the complete environment/SSM parameter value on parse failure. Redact the value entirely.
- **DynamoDB query/scan helpers turn service failures into partial success.** `dynamo-ratchet.ts:151-154,320-323` catches errors and returns `null` or accumulated rows/counts. Callers cannot distinguish complete results from partial data. Rethrow with context or return an explicit partial-result type.
- **The conditional put retry is unbounded recursion.** `dynamo-ratchet.ts:581-605` recursively calls itself after throughput errors with no maximum. Sustained throttling can keep a request alive indefinitely and grow the async chain. Use an iterative bounded retry policy with jitter.

### Med

- **S3 v2 pagination uses the v1 command.** `modules/aws/src/s3/s3-cache-ratchet.ts:456-463` types a ListObjectsV2 request/response but sends `ListObjectsCommand`; `NextContinuationToken` is therefore not reliable and `allSubFolders` can stop after the first page. Use `ListObjectsV2Command` and guard absent `CommonPrefixes`.
- **DynamoDB writes/deletes accept invalid batch sizes.** `dynamo-ratchet.ts:334-410,478-554` does not cap the caller-supplied batch size at DynamoDB's 25-item limit. Validate or internally chunk at 25.
- **Falsy DynamoDB keys are rejected.** `dynamo-ratchet.ts:832-841` uses `if (!input[k])`, rejecting valid numeric key `0` (and other valid falsy representations). Check only `null`/`undefined`.
- **`createTableIfMissing` is an exported stub.** `modules/aws/src/dynamodb/impl/dynamo-expiring-code-provider.ts:28-29` always returns `null`. Implement it or remove it from the public contract.
- **The S3 expiring-code store loses concurrent updates.** `modules/aws/src/s3/impl/s3-expiring-code-provider.ts` performs an unversioned read-modify-write of a shared object. Concurrent code creation/checks can overwrite each other. Use conditional writes, per-code objects, or DynamoDB.
- **S3 existence checks hide outages and authorization failures.** `s3-cache-ratchet.ts:73-80` maps every `HeadObject` error to `false`, treating 403/5xx/network errors as "missing." Only map a confirmed not-found response to false.
- **S3 synchronization reports partial success.** `s3-cache-ratchet.ts:264-278` catches individual copy failures and returns only successful items. Return a result containing failures or reject the operation.
- **S3 listing assumes result arrays always exist.** `modules/aws/src/s3/s3-location-sync-ratchet.ts:132-150` dereferences response collections that can be undefined for an empty page. Default them to empty arrays.
- **S3 copy retries can exhaust and still resolve normally.** `s3-location-sync-ratchet.ts:66-119` logs completion after the retry loop even when no copy succeeded. Throw or return an explicit failed copy result.
- **Environment failures are cached forever.** `modules/aws/src/environment/environment-service.ts:27-37` stores the in-flight promise; if it rejects, all later calls receive that same rejected promise and can never recover from a transient outage. Delete failed promises from the cache.
- **Environment retries are off by one and falsy config values look absent.** `environment-service.ts:51-83` starts/increments the counter so `maxRetries: 3` makes only two attempts, and `fetchConfigValueByPath` rejects valid `false`, `0`, or empty-string values.
- **CloudWatch Insights polling has no deadline.** `modules/aws/src/cloudwatch/cloud-watch-logs-ratchet.ts:209-223` can poll forever and doubles the delay without a cap. Add maximum wait/cancellation and cap the interval.
- **Batch submission failures are converted to null, then dereferenced.** `modules/aws/src/batch/aws-batch-ratchet.ts:34-44` catches the SDK failure; `aws-batch-background-processor.ts:52-56` immediately reads `rval.jobName`. Preserve the original failure and avoid a secondary null exception.
- **Used ECR images are compared by tag alone.** `ecr-unused-image-cleaner.ts:52-54,87-100` discards repository/digest identity. A common tag such as `latest` in one repository protects unrelated images, while digest-only references parse incorrectly. Compare canonical repository + tag/digest identities.

### Low

- **S3 prefix replacement is not anchored.** `s3-location-sync-ratchet.ts` uses `key.replace(srcPrefix, dstPrefix)`, which can replace a matching substring that is not the leading prefix. Validate `startsWith` and slice explicitly.
- **S3 listing limits can be exceeded nondeterministically.** `s3-cache-ratchet.ts:403-437` pushes results inside concurrent work while checking a shared `maxToReturn`, so multiple completions can cross the cap and ordering varies.
- **`bucketVal` throws a string.** `s3-cache-ratchet.ts:469-473` should throw an `Error` so stacks and error handling remain consistent.
- **No active test covers ECR deletion.** The ECR cleaner's suite is skipped, leaving destructive behavior unguarded. Add dry-run fixture tests before enabling deletion tests.

## aws-node-only

### High

- **Generated SQL identifiers come directly from email attachment headers.** `modules/aws-node-only/src/mail/inbound/email-to-db-insert-processor.ts:45-68` inserts minimally transformed CSV column names into `CREATE TABLE`/`INSERT` SQL. A crafted attachment can inject or break SQL. Strictly allowlist identifier characters and quote with the target database adapter.
- **Site uploads report success after file failures.** `modules/aws-node-only/src/cli/site-uploader/site-uploader.ts:112-139` catches every upload error, ignores walker errors, continues, and resolves `true`. Deployments can be incomplete while CI is green. Accumulate failures and reject at the end.

### Med

- **Inbound email is converted through a deprecated string Buffer constructor.** `modules/aws-node-only/src/mail/inbound/inbound-email-ratchet.ts:20-24` fetches as a string and calls `new Buffer(data)`, which can corrupt MIME binary/attachments and emits a deprecation warning. Fetch bytes and use `Buffer.from`.
- **Failed disk-cache loads poison the per-key lock.** `modules/aws-node-only/src/s3/s3-cache-to-local-disk-ratchet.ts:56-72` deletes `currentlyLoading` only after success. A rejected download remains cached forever, so that key cannot recover. Clear it in `finally`.
- **Athena query failures lose their cause and become a later null crash.** `modules/aws-node-only/src/athena/athena-ratchet.ts:145-190` catches failures and returns `null`; callers immediately parse the output URI. Rethrow with the Athena state-change reason.
- **Athena polling has no maximum duration or cancellation.** `athena-ratchet.ts:168-179` waits until a terminal state indefinitely. Add a deadline and issue `StopQueryExecution` on cancellation.
- **Athena file completion watches the wrong stream.** `athena-ratchet.ts:126-132` pipes a readable to a file but resolves on readable `finish/close`; this can return before the write stream flushes. Listen to the destination stream's `finish` and handle errors on both.
- **Email-to-SQL processing returns partial statements after errors.** `email-to-db-insert-processor.ts:93-98` catches all failures and returns whatever was accumulated, which can include `DROP TABLE` without a valid rebuild. Reject atomically instead.

### Low

- **Invalid CLI arguments cause secondary null dereferences.** `modules/aws-node-only/src/cli/start-instance-and-ssh.ts:40-50` can return `null` from `createFromArgs`, then unconditionally calls `inst.run()`.
- **Content-Disposition filenames are not escaped.** `modules/aws-node-only/src/daemon/daemon-util.ts:78-80,121-126` concatenates arbitrary filenames into a quoted header. Strip CR/LF and escape quotes.

## common

### High

- **The mail allowlist can be bypassed through BCC.** `modules/common/src/mail/mailer.ts:57-66,189-201` filters only destination/To addresses, not BCC. Apply the same policy to every recipient field.
- **Fallback handling exposes blind recipients.** When To is empty, `mailer.ts:192-201` copies BCC into To without clearing BCC, revealing addresses and potentially sending twice. Either reject a BCC-only message or move and clear the addresses deliberately.
- **Twilio credentials and OTP data are logged together.** `modules/common/src/third-party/twilio/twilio-verify-ratchet.ts:64` logs the request object containing the Basic Authorization header and verification code. Remove the log and treat existing logs as credential exposure.
- **Numeric range generation can loop forever.** `modules/common/src/lang/number-ratchet.ts:209-215` does not reject a zero or directionally invalid step. Validate finite bounds and require a step that moves toward the end.
- **Bounded parallel execution can loop forever.** `modules/common/src/lang/promise-ratchet.ts:146-160` removes no work when `maxConcurrent <= 0`, leaving `remain.length` unchanged. Validate a positive integer.
- **Password-based encryption has no KDF or salt.** `modules/common/src/lang/simple-encryption-ratchet.ts:77-80` zero-pads/truncates the raw password into an AES key. This makes human passwords cheap to brute-force and creates collisions. Require a full random key or derive one with scrypt/Argon2/PBKDF2 plus a random salt.
- **Geo-bound map lookups accept an out-of-range boundary and can crash.** `modules/common/src/lang/geolocation-ratchet.ts:249-294` stores `maxLat/maxLng` one beyond the final array index and uses inclusive comparisons. Points in that extra strip index an undefined row/cell. Store the true maximum or use exclusive bounds.

### Med

- **Array comparison drops the last unmatched element.** `modules/common/src/lang/array-ratchet.ts:43-47` uses `< length - 1` when appending tails. Use `< length` and add unequal-length regression tests.
- **Subarray extraction violates `maxExclusive`.** `array-ratchet.ts` includes the element at the computed upper index even when it equals the exclusive maximum. Define the boundary with a lower-bound search and slice to the exclusive index.
- **Contiguous range grouping never flushes the final run.** `number-ratchet.ts:144-179` loses the last singleton/range after the loop. Existing tests assert only truthiness; assert exact output.
- **Valid falsy JSON is reported as invalid.** `modules/common/src/lang/string-ratchet.ts:77-96` turns the parsed value into boolean, so `0`, `false`, `null`, and `""` fail `canParseAsJson`. Track parse success separately.
- **Histogram rejects valid falsy values.** `modules/common/src/histogram/histogram.ts:8-15` ignores `0`, `false`, and empty string. Check only null/undefined if those values are valid keys.
- **Transaction rollback hooks run under the wrong conditions.** `modules/common/src/tx/transaction-ratchet.ts:78-94` calls `executeAfterRollbackFailure` for any non-success, not only `RollbackFailed`; rollback also logs "aborting" but continues and can overwrite the first rollback error at `:62-68`.
- **Global/sticky allowlist regexes have stateful results.** `mailer.ts` repeatedly calls `.test()` on caller regexes; `/g` or `/y` patterns mutate `lastIndex` and can alternate accepted/rejected recipients. Reset `lastIndex` or clone without stateful flags.
- **Malformed attachments can crash size filtering.** `mailer.ts:122-132` enters the oversized/missing-data branch and then reads `a.base64Data.length` even when the data is absent.
- **Event listeners are retained after promise settlement.** `promise-ratchet.ts:25-38` adds success/failure listeners but never removes the losing listeners. Use `once` and cleanup both sets on settle.
- **A timeout does not cancel its source operation.** `promise-ratchet.ts` races a timer but leaves the underlying promise running; database/network writes may complete after the caller observes timeout. Accept an `AbortSignal` or clearly separate cancellable APIs.
- **Geo-bound canonicalization tests the wrong values.** `geolocation-ratchet.ts:160-174` computes `lngXover` from latitude variables, and treats ordinary equator/prime-meridian crossings as invalid. Rework this around longitude wrap at +/-180 and allow normal sign changes.
- **Location bounds use longitude scale for latitude too.** `geolocation-ratchet.ts:215-227` derives one degree offset from latitude-dependent longitude width and applies it to both axes, substantially distorting radii away from the equator.
- **2D transforms truncate translation.** `modules/common/src/2d/ratchet-2d.ts` uses `(tx.u | 0)`/`(tx.v | 0)`, discarding fractional values and overflowing to signed 32-bit. Use nullish defaults instead.
- **`transformLines` is a public stub.** `ratchet-2d.ts:283-285` always returns `null`. Implement it or mark/remove the unsupported API.
- **reCAPTCHA secrets/tokens are placed in a URL and logged.** `modules/common/src/third-party/google/google-recaptcha-ratchet.ts:16-25` logs the response token and builds an unencoded query containing the secret. POST form data, encode fields, and redact both values.
- **Twilio response status is not checked.** `twilio-ratchet.ts` and `twilio-verify-ratchet.ts` parse error bodies as ordinary results, so callers may treat a failed send as success. Throw on non-2xx with a redacted error.
- **Base64 helpers log complete failing inputs.** `modules/common/src/lang/base64-ratchet.ts:24-27,59-60,227` can expose JWTs, WebAuthn transfer tokens, or binary secrets. Log length/hash only.
- **A no-recipient email is still sent to the provider.** `mailer.ts:206-208` logs that no destination remains, but `sendEmail` proceeds. Return a failed/skipped result before invoking the provider.

### Low

- **Array comparison sorts caller arrays in place.** `array-ratchet.ts:14-15` has an undocumented mutation. Sort copies.
- **`replaceAll` cannot delete matches.** `string-ratchet.ts:482-487` skips replacement when the destination is an empty string.
- **CSV escaping omits CR/LF.** `string-ratchet.ts` quotes commas/quotes but can emit invalid multi-line CSV fields.
- **`waitFor` performs more attempts than configured.** `promise-ratchet.ts:110-131` checks `count > maxCycles` after running the test. Clarify attempts versus retries and use an exact bound.
- **`fitCurve` mutates its control-point array.** `ratchet-2d.ts:288-304` sorts the caller's data and does not validate empty/duplicate-X inputs.
- **Distance calculation only clamps above 1.** `geolocation-ratchet.ts:28-39` can feed a value slightly below -1 to `acos` for near-antipodal points, yielding `NaN`. Clamp to `[-1, 1]`.

### Optional

- **Random UID/GUID helpers are non-cryptographic.** `string-ratchet.ts:160-210` uses `Math.random`. Rename/document them as non-security identifiers or provide crypto-safe variants to prevent accidental credential use.

## echarts

### Med

- **Rendered chart instances are never disposed.** `modules/echarts/src/common/echart-ratchet.ts:17-23` creates an ECharts instance for every render and does not call `dispose`, leaking resources in long-lived image workers. Dispose in `finally` after producing the buffer.

### Low

- **Rendering mutates the caller's chart options.** `echart-ratchet.ts:16` sets `opt.animation = false`. Clone/merge options so reusable configurations are not changed unexpectedly.

## epsilon-common

### Crit

- **Document-level OpenAPI security is ignored.** `modules/epsilon-common/src/http/route/router-util.ts:170-212` derives authorization only from each operation's `entry.security`; the document model/router never applies root `security`. APIs relying on the OpenAPI global default become unauthenticated. Resolve effective security as operation override or document default, including `security: []` semantics.
- **SQS work is deleted before it is processed.** `modules/epsilon-common/src/background/manager/aws-sqs-sns-background-manager.ts:171-190` parses and deletes the message in `takeEntryFromBackgroundQueue`, then `BackgroundHandler` processes it later. A crash or processor failure permanently loses work and bypasses SQS retry/DLQ behavior. Delete only after successful processing/acknowledgement.

### High

- **OpenAPI query/path validation is not implemented.** `modules/epsilon-common/src/built-in/http/built-in-filters.ts:200-207` returns true unconditionally for both validators, so declared constraints are never enforced.
- **The default filter chain calls query validation twice.** `modules/epsilon-common/src/http/route/router-util.ts:52-53` never invokes `validateInboundPathParams`, even after that stub is implemented.
- **Mixed-case Authorization headers leak into event logs.** `modules/epsilon-common/src/built-in/http/run-handler-as-filter.ts:88-93` redacts only `headers.authorization`; HTTP headers are case-insensitive and `Authorization` remains visible. Use case-insensitive extraction/redaction and avoid logging raw events.
- **A request can change a process-global log level.** `modules/epsilon-common/src/built-in/http/log-level-manipulation-filter.ts:9-23` stores one static previous level. Concurrent Lambda requests race, can restore the wrong value, and an exposed query option can enable verbose logging of sensitive events. Make logging request-scoped or remove this feature from public input.
- **Invalid SQS JSON becomes a poison message.** In `aws-sqs-sns-background-manager.ts:171-193`, deletion happens only after parsing; the catch says the message is dropped but leaves it on the queue to reappear repeatedly (and potentially block a FIFO group). Explicitly quarantine/DLQ malformed payloads.
- **Processor errors are swallowed after the queue item is gone.** `modules/epsilon-common/src/background/background-handler.ts:331-344` catches and returns false. Combined with early deletion, Lambda cannot retry or route the failure to a DLQ. Throw after recording failure or implement explicit retry/ack semantics.
- **JWT roles passed by callers are discarded.** `modules/epsilon-common/src/http/auth/local-web-token-manipulator.ts:80-103` accepts a `roles` array but never includes it in the signed payload, breaking role-based authorization expectations.
- **Handler timeouts do not stop handler side effects.** `run-handler-as-filter.ts` returns a timeout response while the underlying handler keeps running. Pass an abort signal/cancellation contract or avoid claiming the request was terminated.

### Med

- **Duplicate `scripts` keys discard half the package commands.** `modules/epsilon-common/package.json:44,65` defines the same JSON key twice; parsers keep only the latter block, so the run-local/sample scripts in the first block are unreachable. Merge the two objects and add a package-manifest validation check.
- **Path-level OpenAPI fields are treated as HTTP methods.** `router-util.ts:170-177` iterates every key under a path; valid keys such as `parameters`, `summary`, and `servers` are parsed as operations and can trigger missing-handler failures. Filter to the HTTP verb set.
- **OpenAPI security alternatives are rejected instead of OR'ed.** `router-util.ts:203-212` supports exactly one security requirement. Implement OpenAPI's list-of-alternatives semantics.
- **Redirect responses contain malformed JSON.** `modules/epsilon-common/src/http/response-util.ts:50-76` omits the closing quote around the target in its JSON body. Build the body with `JSON.stringify`.
- **Binary response coercion can erase Content-Type.** `response-util.ts:91-95` assigns `input.body.contentType` even when undefined. Preserve an existing header or require an explicit value.
- **Basic-auth parsing rejects valid passwords and logs credentials.** `modules/epsilon-common/src/http/event-util.ts:202-207` splits on every colon and logs the decoded pair. Split only at the first colon and never log it.
- **JWT `iat` is written in milliseconds.** `local-web-token-manipulator.ts:88-96` uses `Date.now()` for a JWT NumericDate field; downstream `JwtRatchet` corrects `exp` but retains the millisecond `iat`. Use epoch seconds.
- **Background "started" transaction logs are usually skipped.** `background-handler.ts:216-226` writes the starting record only when a GUID is missing, while normally wrapped entries already have one. Invert/separate the condition.
- **No-processor notification code is unreachable.** `background-handler.ts:289-300` throws before the `NoMatch` listener block. Notify first or remove the dead branch.
- **Error responses expose internal error strings/details.** Epsilon response error construction returns wrapped names/messages/details to clients. Map internal failures to stable public codes and keep diagnostic detail server-side.
- **Background payloads are logged verbatim.** The manager/handler and `background-http-adapter-handler.ts:94` log full work data and SQS bodies, which can contain customer or credential data. Use identifiers and redacted metadata.
- **Response size is checked in JavaScript characters, not bytes.** `response-util.ts` can undercount multibyte UTF-8 bodies against API Gateway/Lambda byte limits.

### Low

- **Redirect query names are not encoded.** `response-util.ts:58-66` encodes values but concatenates raw parameter names.
- **Private-network detection misses most of 172.16/12.** `event-util.ts:21-26` recognizes 172.16 only, not 172.17 through 172.31.
- **Google discovery fetch does not check `response.ok`.** The auth manipulator can parse/cache an error page as discovery data; validate status and schema.
- **Background processed-count starts as null.** `background-handler.ts` relies on `null + 1` coercion and can return null when nothing ran. Initialize to zero.

## epsilon-deployment

### High

- **Credentialed wildcard CORS is invalid.** `modules/epsilon-deployment/src/deployment/cdk/epsilon-api-stack.ts:222-230` combines `allowedOrigins: ['*']` with `allowCredentials: true`; browsers reject credentialed wildcard responses. Use explicit trusted origins or disable credentials.
- **The Lambda Function URL is publicly bypassable.** `epsilon-api-stack.ts:222-224` sets `FunctionUrlAuthType.NONE`. If CloudFront/WAF/custom-domain controls are expected, clients can call the origin URL directly. Use IAM auth or an origin-verification design and restrict the function URL.
- **Default IAM policies are far broader than necessary.** `modules/epsilon-deployment/src/deployment/cdk/epsilon-stack-util.ts:34-121` grants `sqs:*`, `sns:*`, `batch:*`, `ecs:*`, all-resource secret/SSM reads, and all-resource KMS decrypt. Reduce actions/resources to the created queues/topics/jobs and named secrets/keys.
- **Security-group IDs are corrupted.** `epsilon-api-stack.ts:117-119` unconditionally prepends `sg-` to `lambdaSecurityGroupIds`; callers naturally passing `sg-...` produce `sg-sg-...`. Accept full IDs as named.
- **Apex-domain extraction fails for public suffixes.** `epsilon-stack-util.ts:123-129` reduces `api.example.co.uk` to `co.uk`, causing hosted-zone lookup/record failures. Use an explicit hosted zone or a Public Suffix List implementation.
- **Multiple website domains reuse the same CDK construct ID.** `modules/epsilon-deployment/src/deployment/cdk/epsilon-website-stack.ts:123-131` calls `HostedZone.fromLookup(this, id, ...)` inside a loop. The second domain collides during synthesis. Include the domain/index in the construct ID.

### Med

- **Optional stack props are dereferenced as required.** Stack constructors accept optional `props`, then immediately access fields such as `props.dockerFileFolder`; strict-null checking is disabled, so an allowed call shape crashes at runtime. Make props required or supply complete defaults.
- **Website behavior props are unused.** `modules/epsilon-deployment/src/deployment/cdk/epsilon-website-stack-props.ts:16-17` exposes `websiteCacheBehavior` and `websiteBehaviorOverride`, but the stack never reads them. Implement or remove the misleading configuration.
- **Website buckets default to destructive teardown.** `epsilon-website-stack.ts:30-35` uses `RemovalPolicy.DESTROY` and auto-delete unless the caller opts into retention. Prefer retention by default for deployable/user-managed assets and require explicit destructive intent.
- **The container image asset is constructed twice.** `epsilon-api-stack.ts` creates a `DockerImageAsset` and separately uses `DockerImageCode.fromImageAsset`, causing redundant asset work and making it unclear which asset is authoritative.

### Optional

- **Batch Fargate is publicly addressed and has a writable root filesystem.** `epsilon-api-stack.ts:158,165` sets `assignPublicIp: true` and `readonlyRootFilesystem: false`. Use private subnets/NAT or VPC endpoints and a read-only root where workloads permit.

## graphql

### High

- **Authenticated clients are cached forever by raw JWT.** `modules/graphql/src/graphql/graphql-ratchet.ts:14,62-75` retains every token as a `Map` key until manual cache clear/endpoint change. Long-lived applications leak memory and retain expired credentials. Cache a single current client, use bounded eviction, or key by a non-secret fingerprint.

### Med

- **The advertised default error handler is unreachable.** `graphql-ratchet.ts:24-32` requires `opsIn.errorHandler` before merging `new DefaultGraphqlRatchetErrorHandler()`, even though the option is optional. Remove the precondition and apply defaults first.
- **GraphQL failures are swallowed by default.** `modules/graphql/src/graphql/provider/default-graphql-ratchet-error-handler.ts:6-16` defaults `rethrow` to false; query/mutation methods then return null, making transport/auth/schema failures indistinguishable from valid null data. Prefer reject-by-default or a typed result.
- **Queries, variables, mutations, and results are logged.** `graphql-ratchet.ts:132-173` and the default error handler include full GQL/variables/results, commonly containing credentials or personal data. Redact variables and log operation names/correlation IDs.
- **The entire GraphQL test suite is skipped.** Authentication-style, error, caching, and extraction behaviors have no active regression protection.

### Low

- **Endpoint-change logging omits its values.** `graphql-ratchet.ts:105` has two placeholders and no arguments.
- **Client terminology/log messages still say Apollo.** The implementation uses `graphql-request`, making diagnostics and maintenance confusing.

## maze

### Med

- **Negative coordinates/indices are accepted as valid.** `modules/maze/src/model/rectangular-maze.ts:58-79` checks only upper coordinate bounds; `validIdx(-1)` can return true. Enforce integer `0 <= x < width`, `0 <= y < height`, and `0 <= idx <= maxIdx`.
- **SVG options are optional in the type but mandatory at runtime.** `modules/maze/src/model/drawing-util.ts:48-56` dereferences `opts.cellSize` with no default. Make the argument required or merge defaults.
- **Passages need not connect neighboring cells.** `rectangular-maze.ts:111-128` accepts any two valid indices, allowing non-geometric edges that `hasWall` cannot represent coherently. Require Manhattan distance one unless arbitrary graph edges are intended.
- **The module has no tests.** Boundary validation, passage symmetry, disabled cells, generators, and SVG output are unprotected.

### Low

- **Drawing colors are ignored.** `drawing-util.ts:63-84` hard-codes `#000080` and never uses `backgroundColor`, `wallColor`, or `disabledColor` from `RectangularMazeDrawOptions`.
- **`hasPassage` can return `undefined` despite a boolean signature.** `rectangular-maze.ts:99-106` assigns `vals && ...`; normalize with `!!`.
- **Source style/imports are inconsistent.** Maze uses double quotes, missing `.js` extensions, unused imports, compressed spacing, and leftover "DELETE ME" sample code; restore lint/formatting and remove dead scaffolding.

## misc

### High

- **The timeout observable never completes after timing out.** `modules/misc/src/rxjs/observable-ratchet.ts:17-25` emits a `TimeoutToken` but does not complete. When it wins `race`, downstream completion-dependent flows can hang. Emit once and complete, and return teardown that clears the timer.

### Med

- **Remote templates accept non-2xx bodies as templates.** `modules/misc/src/handlebars/remote-handlebars-template-renderer.ts:73-83` calls `resp.text()` without checking status, so 404/error HTML can be compiled and rendered. Validate `ok`, content type, and size.
- **Remote template failures become null output.** `remote-handlebars-template-renderer.ts:47-71` catches fetch/compile errors and returns null, hiding a broken email/page render. Reject or return a typed failure.
- **Global Handlebars partial registration can cross-contaminate requests.** `remote-handlebars-template-renderer.ts:29-36` registers layouts on the process-global Handlebars instance by caller-provided name. Concurrent tenants/templates can overwrite each other. Use isolated Handlebars environments or unique immutable names.
- **Brevo silently substitutes `a@a.com` as sender.** `modules/misc/src/brevo/brevo-mail-sending-provider.ts:23-38` turns missing configuration into a likely delivery failure. Validate a real sender before calling the API.
- **Generated API clients are committed alongside hand-written code.** `modules/misc/src/brevo/generated` and `sobol/generated` dominate the module and make manual lint/style changes fragile. Document exact generator/version and regenerate deterministically in CI; exclude generated code from hand-formatting rules where appropriate.

### Low

- **RPN accepts surplus operands silently.** `modules/misc/src/handlebars/handlebars-ratchet.ts:117-151` returns only the top stack item without requiring exactly one final value, masking template mistakes.
- **Model validation logs the entire schema set.** `modules/misc/src/model-validator/model-validator.ts:35-40` can create large/noisy logs and may expose internal schema descriptions. Log the selected model name and error count.

## node-only

### High

- **Invalid JWTs are logged in full.** `modules/node-only/src/jwt/jwt-ratchet.ts:123-125` includes the complete token when verification fails. Tokens may still be valid under another key/environment and contain readable personal claims. Log a fingerprint only.
- **Web-to-Node readable conversion can hang on read rejection.** `modules/node-only/src/stream/node-stream-ratchet.ts:49-59` has no rejection handler for `reader.read()`, so the Node stream is never ended/destroyed on source failure. Catch and call `out.destroy(error)`.
- **A Common Crawl read can hang forever after a stream failure.** `modules/node-only/src/third-party/common-crawl/common-crawl-service.ts:103-131` only logs stream errors and then waits in `while (!rval)`. Reject on error/close-without-data and enforce a timeout.

### Med

- **The export builder does not evaluate its regular expressions.** `modules/node-only/src/export-builder/export-map-builder.ts:60-66` returns true for any nonempty regex list, so include/exclude configuration does not work. Actually call `RegExp.test` with stable `lastIndex` handling.
- **Multiple include patterns rescan and collide.** `export-map-builder.ts:41-44` traverses the entire tree once per include despite not applying the pattern; more than one include can report duplicate exports. Traverse once.
- **The export parser misses most valid TypeScript exports.** `export-map-builder.ts:68-91` recognizes only simple `export class/interface`, ignoring functions, constants, types, enums, re-exports, multiline syntax, and defaults. Use the TypeScript AST.
- **Writable-stream conversion ignores backpressure and errors.** `node-stream-ratchet.ts:62-74` calls callbacks immediately without awaiting `writer.write()`/`writer.close()`. Await the returned promises and pass rejections to callbacks.
- **Common Crawl byte ranges are off by two.** `modules/node-only/src/third-party/common-crawl/common-crawl-service.ts:75` uses inclusive end `offset + length + 1`; the correct end is `offset + length - 1`. Extra bytes can corrupt gzip/WARC parsing.
- **Language-specific page reads ignore the language argument.** `common-crawl-service.ts:35-48` loops languages but calls `pullPageEntry(entry)` without `lang`, duplicating the same content under every language.
- **Files-to-static-class silently overwrites duplicate basenames.** `modules/node-only/src/files/files-to-static-class.ts:33-50` keys every recursive file only by basename; two folders containing `index.html` generate duplicate object keys and one value wins. Use relative paths or reject collisions.
- **Slack notification failures can look successful.** `modules/node-only/src/third-party/slack/publish-ci-release-to-slack.ts:52-69` returns the response body without checking `response.ok`. Throw on non-2xx.
- **Git command failure detection is unreliable.** `modules/node-only/src/third-party/git/git-ratchet.ts:20-36` ignores the `err` argument, rejects on any stderr (including warnings), and may resolve after a reject call. Use `err`/exit code and return after settling.

### Low

- **Unique-file CLI returns a stringified Promise.** `modules/node-only/src/files/unique-file-rename.ts:73-78` passes `UniqueFileRename.process(...)` to `StringRatchet.safeString` without awaiting it, so CLI output is wrong even though work starts.
- **The local directory listing is not HTML-escaped.** `modules/node-only/src/http/local-file-server.ts:127-143` inserts filenames/paths into HTML and attributes. A crafted local filename can execute script in the browser. Escape text and URL-encode links.
- **Synchronous readable draining is misleading/incomplete.** `node-stream-ratchet.ts:18-27` only collects chunks already buffered at that instant; it does not wait for asynchronous streams. Rename to indicate buffered-only behavior or provide an async implementation.

## rdbms

### Crit

- **Transactional queries run on different connections from begin/commit/rollback.** `modules/rdbms/src/service/transactional-named-parameter-database-service.ts:46-90` begins/commits via `connectionProvider.getDatabaseAccess()`, while inherited queries call `getDB()`, whose non-pooled branch creates a new connection every time at `named-parameter-database-service.ts:391-399`. Statements can autocommit outside the transaction, rollback cannot undo them, and non-pooled connections leak. Create and retain exactly one connection for the transaction lifetime and route every operation through it.

### High

- **Named-parameter substitution is prefix-order dependent.** `modules/rdbms/src/util/named-parameter-adapter/named-parameter-adapter.ts:13-41` uses naive `replaceAll` in object-key order; replacing `:id` corrupts `:id2`, and placeholders inside strings/comments can be altered. Use driver-native bindings or a tokenizer, never textual replacement.
- **Every query strips non-ASCII characters from parameters.** `modules/rdbms/src/query-builder/query-builder.ts:192-203` JSON-serializes params and deletes Unicode. Names, addresses, and international text are silently corrupted. Remove this transformation and rely on proper parameter encoding.
- **`groupBy` is directly interpolated into SQL.** `modules/rdbms/src/service/named-parameter-database-service.ts:187-203` appends caller text without identifier validation. If influenced by request input, this is SQL injection. Accept a constrained enum/allowlist of identifiers.
- **Debug comments permit SQL comment termination/injection.** `query-builder.ts:55-71,214-220` embeds arbitrary comments as `/* ... */`; input containing `*/` escapes the comment. Strip terminators or keep metadata outside SQL.
- **Timed-out queries continue running.** `named-parameter-database-service.ts:211-241` races a timer but never cancels the database request. A modification can commit after the caller receives a timeout and retries. Use driver cancellation/query timeouts and treat mutation retry carefully.
- **Transient-error retry can duplicate mutations.** `named-parameter-database-service.ts:290-339` retries `Modify` requests after socket/timeouts/lock waits even when the server may have committed but the response was lost. Retry only provably idempotent operations or require an idempotency key/transaction outcome check.
- **Transaction helpers swallow failure as null.** `transactional-named-parameter-database-service.ts:96-130` catches query errors, attempts rollback, and returns null. Callers can continue as if the operation simply had no result. Rethrow with rollback status.

### Med

- **Full SQL and parameter values are logged.** `named-parameter-database-service.ts:325-373` renders paste-ready statements on success/failure, exposing credentials and personal data and creating executable log artifacts. Redact values and gate this behind a secure local-only diagnostic mode.
- **Update retry retries permanent errors and sleeps after the last failure.** `named-parameter-database-service.ts:117-140` catches every exception, including syntax/constraint errors, and waits even when no retry remains. Classify transient errors and stop immediately otherwise.
- **Non-pooled connections are not closed per request.** `getDB()` creates a fresh access object but the normal execution path never closes it; `cleanShutdown` closes the provider's pooled access instead. Define ownership and close in `finally`.
- **Postgres SSH tunnels leak when DB connection fails.** The Postgres connection provider creates a tunnel, then returns undefined on database-connect failure without shutting the tunnel. Close all partially created resources in `catch/finally`.

### Low

- **NamedParameterAdapter mutates caller input.** `named-parameter-adapter.ts:15` uses `Object.assign(qap)` rather than cloning into a new target.
- **Postgres cache clearing reports false even after cleanup.** The connection provider initializes its return value to false and never changes it, giving callers incorrect shutdown status.
- **Async cleanup is registered on `process.exit`.** Exit handlers cannot await promises, so database/tunnel shutdown may be abandoned. Use signal/beforeExit orchestration with an explicit shutdown path.
- **Several core DB suites are skipped.** RDS, SQLite pagination, and integration paths do not actively verify the transaction and substitution behavior above.

## warden-common

### Crit

- **Client authentication code logs reusable credentials.** `modules/warden-common/src/client/warden-user-service.ts:214,254,307,324,398-400` logs full JWTs/login results, OTPs, third-party tokens, and WebAuthn assertions. Remove all credential payload logging and rotate/revoke tokens present in retained logs.

### High

- **Auto-refresh operations can overlap.** `warden-user-service.ts:48,93-113` invokes an async timer callback without a mutex/exhaust strategy; if refresh takes longer than the interval, multiple refresh/login/logout events race and can overwrite state. Serialize checks and suppress a new tick while one is active.

### Med

- **A public method applies an unverified JWT directly to client authorization state.** `warden-user-service.ts:202-225` decodes without signature verification and stores the supplied roles/user. Limit the API, clearly mark the wrapper untrusted, and ensure server-side authorization never relies on this state.
- **Authorization helpers can throw on ordinary users.** `modules/warden-common/src/common/util/warden-utils.ts:252-266` dereferences `user.teamRoleMappings` without defaulting the optional collection. Treat missing mappings as empty.
- **Stored auth state can fail silently before storage initialization.** The storage providers log and ignore attempts to set a user/recent login before storage is ready, losing a successful login. Buffer the update or make initialization explicit/awaitable.
- **Contact normalization is inconsistent.** Email/phone comparisons and storage lookups are case/string-format sensitive while only some UI paths lowercase values. Normalize centrally before uniqueness checks and lookup.

### Low

- **Role strings accept malformed extra delimiters/empty IDs.** `warden-utils.ts` splits without strict shape validation. Reject malformed mappings instead of creating ambiguous authorization data.
- **Only three utility tests cover the large client/auth surface.** Add tests for timer races, missing mappings, storage readiness, and every credential-redaction boundary.

## warden-server

### Crit

- **An unauthorised command can remove another user's WebAuthn credential.** `modules/warden-server/src/server/warden-service.ts:232-239` accepts `cmd.removeWebAuthnRegistration.userId` and never verifies it against `loggedInUserId` or an admin authorizer. Remove the command or require an explicit privileged authorization check.
- **WebAuthn assertions are replayable.** `warden-service.ts:813-846` verifies against the stored challenge/counter but never persists `verification.authenticationInfo.newCounter` and never clears/rotates the challenge. The same captured assertion can continue to verify against stale state. Atomically update the counter and consume the challenge after successful verification.
- **Server command/login logs contain every credential type.** `warden-service.ts:132,740,765-768,792`, plus the mailer provider at `modules/warden-server/src/server/provider/warden-mailer-and-expiring-code-ratchet-single-use-code-provider.ts:113,135`, log complete commands, OTP/fixed tokens, third-party tokens, refresh JWTs, assertions, and magic-link contexts. Remove/redact these logs and rotate exposed material.

### High

- **"Single-use" email codes are not consumed.** `warden-service.ts:799-800` and `warden-mailer-and-expiring-code-ratchet-single-use-code-provider.ts:62-64` call `checkCode` without `deleteOnMatch`; the underlying expiring-code provider defaults to retaining it. A code can be replayed until expiry. Consume it atomically on a successful check.
- **WebAuthn import tokens have no integrity protection.** `warden-service.ts:374-390` accepts Base64 JSON, replaces an authenticator, and imports a challenge without signature/encryption/schema/origin validation. Sign and expire transfer tokens, bind them to source/target user and RP, and require reauthentication.
- **Account uniqueness is check-then-save.** `warden-service.ts:455-484` separately searches and writes; concurrent requests can create duplicate contact/third-party identities unless every storage provider enforces uniqueness atomically. Add conditional writes/unique constraints.
- **The S3 single-file storage provider loses concurrent writes.** `modules/warden-server/src/server/provider/warden-s3-single-file-storage-provider.ts` rewrites the complete users/challenges document with no version condition or lock. Concurrent logins/account changes can overwrite each other. Use DynamoDB or S3 ETag conditional writes with retry.

### Med

- **Existing WebAuthn credentials are excluded by public key, not credential ID.** `warden-service.ts:577-582` supplies `credentialPublicKeyBase64` as `excludeCredentials.id`; browsers will not recognize the registered credential. Use `credentialIdBase64`.
- **Imported challenges are stored under origin instead of RP ID.** `warden-service.ts:387-388` keys the challenge by `newEntry.entry.origin`, while normal challenge fetches use the origin hostname/RP ID. Imported authentication cannot retrieve the intended challenge.
- **Refresh assumes token user and stored user both exist.** `warden-service.ts:273-281` dereferences `parsed.user.userId` and `user.userTokenExpirationSeconds` without guards. A removed user or malformed-but-signed legacy token becomes a 500. Reject as unauthorized.
- **Create-account paths bypass the user-created event.** `warden-service.ts:455-489` calls `storageProvider.saveEntry` directly rather than `saveNewUser`, so `eventProcessor.userCreated` is not invoked for normal/third-party account creation.
- **Duplicate contacts can be appended.** `warden-service.ts:508-520` permits adding the same contact repeatedly when it already belongs to the current user. Return success idempotently or deduplicate.
- **Registration challenges are not consumed.** `warden-service.ts:612-655` leaves a verified challenge in storage. Consume/rotate it in the same operation that stores the credential.
- **Authentication challenge generation assumes a populated user/authenticator array.** `warden-service.ts:678-688` can throw a generic null error for unknown users or accounts without authenticators. Return a stable authentication failure without account-enumerating detail.

### Low

- **Fixed tokens are reusable by design but insufficiently isolated.** If retained for support/testing, require environment scoping, expiry, rate limiting, and explicit production disablement.
- **Login errors reveal whether a user/provider exists.** Distinct server messages around `warden-service.ts:765-783` facilitate account/provider enumeration. Normalize public errors and rate-limit attempts.
