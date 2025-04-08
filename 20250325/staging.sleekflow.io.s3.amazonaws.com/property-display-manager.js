import { NullPropertyDriver } from "../drivers";
export class PropertyDisplayManager {
  constructor() {
    this.drivers = {};
  }
  initialize(elsaStudio) {
    if (this.initialized)
      return;
    this.elsaStudio = elsaStudio;
    this.initialized = true;
  }
  addDriver(controlType, driverFactory) {
    this.drivers[controlType] = driverFactory;
  }
  display(activity, property) {
    const driver = this.getDriver(property.uiHint);
    return driver.display(activity, property);
  }
  update(activity, property, form) {
    const driver = this.getDriver(property.uiHint);
    const update = driver.update;
    if (!update)
      return;
    return update(activity, property, form);
  }
  getDriver(type) {
    const driverFactory = this.drivers[type] || ((_) => new NullPropertyDriver());
    return driverFactory(this.elsaStudio);
  }
}
export const propertyDisplayManager = new PropertyDisplayManager();
