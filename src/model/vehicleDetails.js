export class VehicleDetailsList {
    static toList(json) {
        return JSON.parse(json);
    }

    static listToJson(value) {
        return JSON.stringify(value);
    }
}