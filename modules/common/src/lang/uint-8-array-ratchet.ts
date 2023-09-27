// Uint8Array is the common denominator between node and web apis
// https://medium.com/@naveenkumarasinghe/javascript-lost-in-binaries-buffer-blob-uint8array-arraybuffer-ed8d2b4de44a
export class Uint8ArrayRatchet {
  // Empty constructor prevents instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  // Taken from https://stackoverflow.com/questions/49129643/how-do-i-merge-an-array-of-uint8arrays
  public static mergeArrays(myArrays: Uint8Array[]): Uint8Array {
    let rval: Uint8Array = null;
    if (myArrays?.length) {
      // Get the total length of all arrays.
      let length = 0;
      myArrays.forEach((item) => {
        length += item.length;
      });

      // Create a new array with total length and merge all source arrays.
      rval = new Uint8Array(length);
      let offset = 0;
      myArrays.forEach((item) => {
        rval.set(item, offset);
        offset += item.length;
      });
    }
    return rval;
  }

  public static deepEqual(arr1: Uint8Array, arr2: Uint8Array): boolean {
    let rval: boolean = false;
    if (arr1 && arr2 && arr1.length === arr2.length) {
      let mismatch: boolean = false;
      for (let i = 0; i < arr1.length && !mismatch; i++) {
        mismatch = arr1[i] !== arr2[i];
      }
      rval = !mismatch;
    }
    return rval;
  }
}
