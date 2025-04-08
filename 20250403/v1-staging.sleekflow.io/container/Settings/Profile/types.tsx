export enum VersionDic {
  v1 = "v1",
  v2 = "v2",
}
export type VersionType = keyof typeof VersionDic;
