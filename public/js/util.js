define(function () {
  const noop = () => {};
  const identity = value => value;

  function get(data, path, defaultValue) {
    if (data == null || path == null) {
      return defaultValue;
    }
    if (Array.isArray(path)) {
      if (!path.length) {
        return data;
      }
      const field = path.shift();

      data = Array.isArray(data) ? data.map(item => item[field]) : data[field];

      return get(data, path, defaultValue);
    }

    return get(data, path.split('.'), defaultValue);
  }

  function padding(value, length, placeholder = '0') {
    let remain = 0;

    if (value == null || !length) {
      return value;
    }
    value = value.toString();
    remain = length - value.length;
    if (remain === 0) {
      return value;
    }
    if (remain < 0) {
      return value.substr(0, length);
    }
    while (remain--) {
      value = placeholder + value;
    }
    return value;
  }

  function datetime(value, part/* 'date' | 'time' */) {
    const t = value == null ? new Date() : new Date(value);
    const year = t.getFullYear();
    const month = padding(t.getMonth() + 1, 2);
    const date = padding(t.getDate(), 2);
    const hours = padding(t.getHours(), 2);
    const minutes = padding(t.getMinutes(), 2);
    const seconds = padding(t.getSeconds(), 2);

    if (part === 'date') {
      return `${year}-${month}-${date}`;
    }
    if (part === 'time') {
      return `${hours}:${minutes}:${seconds}`;
    }

    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
  }

  return { noop, identity, get, padding, datetime };
});
