
export default class ArrayHelper {

    static containsAll(array0, array1, key) {
        let hasAll = true;
        array0?.forEach((obj) => {
            if (key) {
                if (!array1?.includes(obj[key])) hasAll = false;
            } else {
                if (!array1?.includes(obj)) hasAll = false;
            }
        });
        return hasAll;
    }


}