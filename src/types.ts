
interface WeaponApiResult {
  "response": {
    [key: string]: Weapon;
  }
}

interface Weapon {
  "damageType": string,
  "gameId": string,
  "imageUri": string,
  "isObtained": boolean,
  "name": string,
  "rarityNumber": string,
  "refUri": string,
  "checked": boolean,
  "_matched": IndexDict | object,
  "_score": number,

}

interface WeaponLog {
  // Adapt from Weapon, but add new fields.
  "damageType": string,
  "gameId": string,
  "imageUri": string,
  "isObtained": boolean,
  "name": string,
  "rarityNumber": string,
  "refUri": string,
  "checked": boolean,
  "_matched": IndexDict | object,
  "_score": number,
  "Timestamp": string,

}
type IndexDict = {
  [key: string]: number[][];
};

export type { Weapon, WeaponApiResult, WeaponLog, IndexDict };
