'use strict';

class FeaturesDataManager {
  constructor() {
    this.supportedFeatures = {
      workflowLayout: 'workflowLayout'
    };
    this.getFeatureList = () => {
      return Object.keys(this.features);
    };
    this.getUIFeatureList = () => {
      return Object.keys(this.features).filter(feature => this.features[feature].ui);
    };
    this.getFeatureConfig = (name) => {
      const value = localStorage.getItem(`elsa.properties.${name}`);
      const enabled = localStorage.getItem(`elsa.properties.${name}.enabled`);
      const feature = this.features[name];
      if (feature) {
        return Object.assign(Object.assign({}, feature), { value: value === null ? feature.defaultValue : value, 'enabled': enabled === null ? feature.enabled : enabled === 'true' });
      }
    };
    this.setFeatureConfig = (name, value) => {
      const feature = this.features[name];
      if (feature) {
        localStorage.setItem(`elsa.properties.${name}`, value);
      }
    };
    this.setEnableStatus = (name, value) => {
      const feature = this.features[name];
      if (feature) {
        localStorage.setItem(`elsa.properties.${name}.enabled`, `${value}`);
        console.log(`elsa.properties.${name}-enabled`, value);
      }
    };
  }
  initialize(elsaStudio) {
    if (this.initialized)
      return;
    this.elsaStudio = elsaStudio;
    this.initialized = true;
    this.features = elsaStudio.features || {};
  }
}
const featuresDataManager = new FeaturesDataManager();

exports.FeaturesDataManager = FeaturesDataManager;
exports.featuresDataManager = featuresDataManager;
