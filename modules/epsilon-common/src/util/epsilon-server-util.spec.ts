import { describe, expect, test } from "vitest";
import { EpsilonServerMode } from "../config/espilon-server-mode";
import { EpsilonServerUtil } from "./epsilon-server-util";

describe('#epsilonServerUtil', function () {
  test('should extract server type', async () => {
    process.env['MYTEST']='Production';
    const val: EpsilonServerMode = EpsilonServerUtil.serverMode('MYTEST', null);
    expect(val).toEqual(EpsilonServerMode.Production);

    process.env['MYTEST']='asdf';
    const val2: EpsilonServerMode = EpsilonServerUtil.serverMode('MYTEST', null);
    expect(val2).toBeNull;

    const val3: EpsilonServerMode = EpsilonServerUtil.serverMode('MYTEST', EpsilonServerMode.QA);
    expect(val3).toEqual(EpsilonServerMode.QA);

   });
});
