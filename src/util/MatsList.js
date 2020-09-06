"use strict"

/**
 * <p>Represents a list of mat numbers, made up of ranges and individual numbers
 * (for example:  <p>1-3,5,9-12</p>).  Mat numbers in a list must be in ascending
 * order, may not be negative, and cannot contain duplicates.</p>
 */
class MatsList {

    /**
     * <p>Construct a new MatsList from the specified string.</p>
     *
     * @param list The list of mat numbers in string form
     *
     * @throws Error if the list of mat numbers is not syntactically valid
     */
    constructor(list) {
        this._explode(list);
    };

    #exploded = [ ];
    #highest = 0;

    /**
     * <p>Explode the specified list into its array version, if valid; otherwise,
     * throw an appropriate error.
     *
     * @param list String containing the incoming list
     */
    _explode(list) {
        let items = list.split(",");
        if (items.length < 1) {
            throw new Error("'" + list + "' must contain at least one item");
        }
        items.forEach( (item) => {
            item = item.trim();
            if (item.length < 1) {
                throw new Error("'" + list + "' must not contain an empty item");
            }
            if (item.includes("-")) {
                let subitems = item.split("-");
                if (subitems.length != 2) {
                    throw new Error("'" + item + "' must not contain more than one dash");
                }
                let from = this._validated(subitems[0]);
                let to = this._validated(subitems[1]);
                if (from > to) {
                    throw new Error("'" + item + "' must have lower number first");
                } else if (from <= this.#highest) {
                    throw new Error("'" + item + "' is out of ascending order");
                }
                for (let i = from; i <= to; i++) {
                    this.#exploded.push(i);
                }
                this.#highest = to;
            } else {
                let only = this._validated(item);
                if (only <= this.#highest) {
                    throw new Error("'" + only + "' is out of ascending order");
                }
                this.#exploded.push(only);
                this.#highest = only;
            }
        });

    };

    /**
     * <p>Return the exploded list as an array of integer values.</p>
     */
    exploded() {
        return this.#exploded;
    }

    /**
     * <p>Return true if the specified mat number is included in this list,
     * else return false.</p>
     */
    isMemberOf(matNumber) {
        for (var i = 0; i < this.#exploded.length; i++) {
            if (this.#exploded[i] === matNumber) {
                return true;
            }
        }
        return false;
    }

    /**
     * <p>Return true if this MatsList is a subset (or exact match) for
     * the specified MatsList, else return false.
     *
     * @param matsList MatsList we are checking that we are a subset of
     */
    isSubsetOf(matsList) {
        let result = true;
        this.#exploded.forEach((matNumber) => {
            if (!matsList.isMemberOf(matNumber)) {
                result = false;
            }
        });
        return result;
    }

    /**
     * <p>Return the string representation of the exploded list.</p>
     */
    toString() {
        return "" + this.#exploded;
    }

    /**
     * <p>Return the integer value of the specified string, or throw an
     * error if this item cannot be converted.</p>
     *
     * @param item String item to be converted and validated
     *
     * @return Integer version of this item
     */
    _validated(item) {
        let trimmed = item.trim();
        if (trimmed.length < 1) {
            throw new Error("'" + item + "' cannot be blank");
        }
        let parsed = parseInt(trimmed);
        if (isNaN(parsed)) {
            throw new Error("'" + item + "' is not a number");
        } else if (parsed < 1) {
            throw new Error("'" + item + "' must be positive");
        } else {
            return parsed;
        }
    }

}

module.exports = MatsList;
