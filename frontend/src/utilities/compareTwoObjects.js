/**
 * Performs a deep comparison between two values to determine if they are equivalent.
 * Handles primitives, arrays, and plain objects.
 * This function is crucial for comparing object contents in React.
 *
 * @param {*} val1 - The first value to compare.
 * @param {*} val2 - The second value to compare.
 * @returns {boolean} - True if the values are deeply equal, false otherwise.
 */
function areObjectsDeeplyEqual(val1, val2) {
    // 1. Strict equality check for primitives and same object reference
    if (val1 === val2) {
        return true;
    }

    // 2. Handle null or non-object types
    // If either is null or not an object, and they weren't strictly equal, they are not equal.
    if (val1 === null || typeof val1 !== 'object' ||
        val2 === null || typeof val2 !== 'object') {
        return false;
    }

    // 3. Handle Arrays
    if (Array.isArray(val1) && Array.isArray(val2)) {
        if (val1.length !== val2.length) {
            return false; // Arrays of different lengths are not equal
        }
        // Recursively compare each element
        for (let i = 0; i < val1.length; i++) {
            if (!areObjectsDeeplyEqual(val1[i], val2[i])) {
                return false;
            }
        }
        return true;
    }

    // If one is an array and the other is not, they are not equal (after checking for non-objects)
    if (Array.isArray(val1) !== Array.isArray(val2)) {
        return false;
    }

    // 4. Handle Plain Objects
    const keys1 = Object.keys(val1);
    const keys2 = Object.keys(val2);

    if (keys1.length !== keys2.length) {
        return false; // Different number of keys
    }

    for (const key of keys1) {
        // Check if key exists in val2 and recursively compare values
        if (!Object.prototype.hasOwnProperty.call(val2, key) || !areObjectsDeeplyEqual(val1[key], val2[key])) {
            return false;
        }
    }

    return true;
}


export default areObjectsDeeplyEqual;