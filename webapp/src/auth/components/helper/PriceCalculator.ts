export default {
  getCalculatorPriceItem(price: number, qty: number, discountPercent: number, taxPercent: number) {
    const discountAmount = price * qty * (discountPercent / 100);
    console.log("discountAmount", discountAmount);
    const totalBeforeTax = price * qty - discountAmount;
    console.log("totalBeforeTax", totalBeforeTax);
    const taxAmount = totalBeforeTax * (taxPercent / 100);
    console.log("taxAmount", taxAmount);
    let _result = totalBeforeTax + taxAmount;
    console.log("_result", _result);
    return parseFloat(_result.toFixed(2));
  },
  getGetPercentFromDiscountPrice(price: number, discountPrice: number): number {
    return 100 - ((1 - (discountPrice / price)) * 100);
  },
  getGetPriceAfterDiscounPercent(price: number, discount_percent: number): number {
    let _discount_price = price * (discount_percent / 100);
    _discount_price = price - _discount_price;
    return _discount_price;
  }
}