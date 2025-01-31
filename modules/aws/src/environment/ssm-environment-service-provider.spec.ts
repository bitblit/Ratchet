import { EnvironmentService } from "./environment-service.js";
import { describe, expect, test } from "vitest";
import { SsmEnvironmentServiceProvider } from "./ssm-environment-service-provider.js";
import { AwsCredentialsRatchet } from "../iam/aws-credentials-ratchet";


describe('#ssmEnvironmentService', function () {
  test.skip('should throw exception on missing environment values', async () => {
    const profile: string = 'profile';//pluma';
    const config: string='Configuration';//Pluma
      AwsCredentialsRatchet.applySetProfileEnvironmentalVariable(profile);
      const environmentService: EnvironmentService<any> = new EnvironmentService<any>(new SsmEnvironmentServiceProvider(), {
        maxRetries: 5,
        backoffMultiplierMS: 500,
      });
      const cfg: any = await environmentService.getConfig(config);
      expect(cfg).not.toBeNull;
  });

});
