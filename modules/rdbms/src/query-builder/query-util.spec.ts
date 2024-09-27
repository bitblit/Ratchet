import { describe, expect, test } from 'vitest';
import { QueryUtil } from './query-util.js';

describe('query-util', () => {
  test('extract used params', () => {
    const test: string =
      'REPLACE /* TicketDao.saveDeliveryInformation */INTO delivery_information (delivery_information_guid, contact_phone, street_1, street_2, city, state, zip) VALUES (:deliveryInformationGuid, :contactPhone, :street1, :street2, :city, :state, :zip)';

    const used: string[] = QueryUtil.extractUsedNamedParams(test);

    expect(used.length).toBe(7);
    expect(used.includes(':deliveryInformationGuid')).toBeTruthy;
    expect(used.includes(':contactPhone')).toBeTruthy;
    expect(used.includes(':street1')).toBeTruthy;
    expect(used.includes(':street2')).toBeTruthy;
    expect(used.includes(':city')).toBeTruthy;
    expect(used.includes(':state')).toBeTruthy;
    expect(used.includes(':zip')).toBeTruthy;
  });
});
