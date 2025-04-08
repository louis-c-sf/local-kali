import './utils-823f97c1.js';

class NullPropertyDriver {
  display(activity, property) {
    return undefined;
  }
  update(activity, property, form) {
  }
}

class PropertyDisplayManager {
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
const propertyDisplayManager = new PropertyDisplayManager();

export { PropertyDisplayManager as P, propertyDisplayManager as p };
