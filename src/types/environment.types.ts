export interface EnvironmentValue {
  key: string;
  value: string;
  type: 'default' | 'secret' | 'any';
  enabled: boolean;
}

export interface Environment {
  id: string;
  name: string;
  values: EnvironmentValue[];
}