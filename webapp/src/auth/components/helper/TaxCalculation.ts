export type ArrayTaxList = Array<{
  tax_percent: number
  tax_price: number | string
}>;
export default {
  getTaxBase(tax_type: "include" | "exclude" | "default" | "non" | string, price?: number, tax_percent?: number) {
    let _price = parseFloat(price as any) || 0;
    let _tax_percent = parseFloat(tax_percent as any) || 0;
    let _result = 0;
    switch (tax_type) {
      case 'exclude':
        _result = (_tax_percent / 100) * _price;
        _result = _price;
        break;
      case 'include':
        _result = _price / (1 + (_tax_percent / 100));
        break;
      case 'non':
        _result = _price;
        break;
      case 'default':
      default:
        throw new Error("It mean need parent set of tax");
        break;
    }
    return _result;
  },
  getTaxPriceFromTaxBase(tax_base: number, tax_percent: number): number {
    tax_base = parseFloat(tax_base as any);
    tax_percent = parseFloat(tax_percent as any);
    let _tax_price = tax_base * (tax_percent / 100);
    return _tax_price;
  },
  getGroupTaxs(tax_values: ArrayTaxList) {
    let _group = {} as any;
    let _arr = [] as ArrayTaxList;
    for (let a = 0; a < tax_values.length; a++) {
      if (tax_values[a].tax_percent == 0) {
        continue;
      }
      if (_group[tax_values[a].tax_percent] == null) {
        _group[tax_values[a].tax_percent] = parseFloat(tax_values[a].tax_price as string);
      } else {
        _group[tax_values[a].tax_percent] += parseFloat(tax_values[a].tax_price as string);
      }
    }
    for (let a in _group) {
      _arr.push({
        tax_percent: a as any,
        tax_price: _group[a]
      })
    }
    return _arr;
  }
}