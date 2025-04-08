import { HashTagField } from "../fields/HashTagField";
import { ConversationStatusField } from "../fields/ConversationStatusField";
import { AwayStatusField } from "../fields/AwayStatusField";
import { KeywordsField } from "../fields/KeywordsField";
import { ChannelField } from "../fields/ChannelField";
import { ListField } from "../fields/ListField";
import { BooleanField } from "../fields/BooleanField";
import { DateField } from "../fields/DateField";
import { TextField } from "../fields/TextField";
import { ChoiceField } from "../fields/ChoiceField";
import { EmailField } from "../fields/EmailField";
import { FieldConfigInterpreterType } from "./FieldConfigInterpreter";
import { LanguageField } from "../fields/LanguageField";
import { UserLanguageField } from "../fields/UserLanguageField";
import { RegexField } from "../fields/RegexField";

export function buildField(
  interpreter: FieldConfigInterpreterType,
  fieldName: string,
  fieldDisplayName: string
) {
  const fieldType = interpreter.fieldType;
  switch (true) {
    // list cases from most narrow ones to more general ones
    case interpreter.isLanguageField(): {
      return new LanguageField(fieldDisplayName);
    }
    case interpreter.isUserLanguage(): {
      return new UserLanguageField(fieldType, fieldName, fieldDisplayName);
    }
    case interpreter.isHashtag(): {
      const choices = interpreter.getConditionValueChoices();
      return new HashTagField(choices, fieldDisplayName);
    }

    case interpreter.isConversationStatus(): {
      const choices = interpreter.getConditionValueChoices();
      return new ConversationStatusField(fieldDisplayName, choices);
    }

    case interpreter.isAwayStatus():
      return new AwayStatusField(fieldDisplayName);

    case interpreter.isRegex():
      return new RegexField(fieldName, fieldDisplayName);

    case interpreter.isKeywords():
      return new KeywordsField(fieldName, fieldDisplayName);

    case interpreter.isChannel():
      return new ChannelField(fieldType, fieldName, fieldDisplayName);

    case interpreter.isUserGroup(): {
      const choices = interpreter.getConditionValueChoices();
      return new ListField(fieldDisplayName, choices);
    }

    case interpreter.isBoolean():
      return new BooleanField(fieldName, fieldDisplayName);

    case interpreter.isDate():
      return new DateField(fieldType, fieldName, fieldDisplayName);

    case interpreter.isString():
      return new TextField(fieldType, fieldName, fieldDisplayName);

    case interpreter.isChoice(): {
      const choices = interpreter.getConditionValueChoices();
      return new ChoiceField(fieldType, fieldName, fieldDisplayName, choices);
    }

    case interpreter.isEmail():
      return new EmailField(fieldName, fieldDisplayName);

    default:
      return new TextField(fieldType, fieldName, fieldDisplayName);
  }
}
