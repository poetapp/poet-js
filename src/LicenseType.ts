export class LicenseType {
  readonly id: string;
  readonly name: string;
  readonly description: string;

  constructor(id: string, name: string, description: string) {
    this.id = id;
    this.name = name;
    this.description = description;
  }
}

export const LicenseTypes: ReadonlyArray<LicenseType> = [
  new LicenseType('license-to-publish', 'License to Publish', 'Publication rights are extended to anyone who provides proof of payment on the Bitcoin blockchain for the amount expressed by the owner of this creative work.'),
  new LicenseType('for-sale', 'For Sale', 'The title of ownership will be transferred to anyone who provides proof of payment on the Bitcoin blockchain for the amount established.')
];