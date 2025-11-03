export interface EnvironmentValue {
  key: string;
  value: string;
  currentValue?: string;
  type: 'default' | 'secret' | 'any';
  enabled: boolean;
}

// Interface for runtime state that includes temporary currentValue
export interface EnvironmentValueWithCurrent extends EnvironmentValue {
  currentValue?: string;
}

export interface Environment {
  id: string;
  name: string;
  values: EnvironmentValue[];
}
