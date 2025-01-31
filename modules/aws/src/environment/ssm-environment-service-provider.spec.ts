import { EnvironmentService } from "./environment-service.js";
import { describe, expect, test } from "vitest";
import { SsmEnvironmentServiceProvider } from "./ssm-environment-service-provider.js";
import { AwsCredentialsRatchet } from "../iam/aws-credentials-ratchet";


describe('#ssmEnvironmentService', function () {
  test('should throw exception on missing environment values', async () => {
    const profile: string = 'pluma';
    const config: string='PlumaConfiguration';
      AwsCredentialsRatchet.applySetProfileEnvironmentalVariable(profile);
      const environmentService: EnvironmentService<any> = new EnvironmentService<any>(new SsmEnvironmentServiceProvider(), {
        maxRetries: 5,
        backoffMultiplierMS: 500,
      });
      const cfg: any = await environmentService.getConfig(config);
      expect(cfg).not.toBeNull;
  });

});
