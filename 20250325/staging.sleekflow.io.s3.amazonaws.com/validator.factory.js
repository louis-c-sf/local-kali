import { defaultValidator, lengthValidator } from "./validators";
export var Validators;
(function (Validators) {
  Validators["Length"] = "length";
})(Validators || (Validators = {}));
export function combineValidators(v1, v2) {
  let combined;
  combined = {
    validate: (x) => {
      const res1 = v1.validate(x);
      const res2 = v2.validate(x);
      if (!res1) {
        combined.errorMessage = v1.errorMessage;
      }
      else if (!res2) {
        combined.errorMessage = v2.errorMessage;
      }
      return res1 && res2;
    },
  };
  return combined;
}
export function getValidator(list) {
  return (list || []).map(v => {
    if (typeof v === 'string') {
      return validatorFactory(v, null);
    }
    else if (v && v.name) {
      v = v;
      return validatorFactory(v.name, v.options);
    }
    else {
      return v;
    }
  }).reduce(combineValidators, defaultValidator);
}
export function validatorFactory(name, options) {
  options = options || {};
  switch (name) {
    case (Validators.Length):
      return lengthValidator(options.min, options.max);
    default:
      return defaultValidator;
  }
}
