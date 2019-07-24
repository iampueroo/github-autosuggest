import github from './configurations/configuration-github';

const CONFIGURATIONS = [github];

export default host => {
  const split_host = host.split('.');
  for (let i = 0; i < CONFIGURATIONS.length; i++) {
    const conf_host = CONFIGURATIONS[i].HOST;
    const number_of_tokens = conf_host.split('.').length;
    if (number_of_tokens > split_host.length) {
      continue;
    }
    if (conf_host === split_host.slice(-1 * number_of_tokens).join('.')) {
      return CONFIGURATIONS[i];
    }
  }
  throw new Error(`Could not find configuration for host "${host}"`);
};
