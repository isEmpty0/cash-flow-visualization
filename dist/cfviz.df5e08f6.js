// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/financial/dist/financial.esm.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fv = fv;
exports.ipmt = ipmt;
exports.irr = irr;
exports.mirr = mirr;
exports.nper = nper;
exports.npv = npv;
exports.pmt = pmt;
exports.ppmt = ppmt;
exports.pv = pv;
exports.rate = rate;
exports.PaymentDueTime = void 0;

/**
 * When payments are due
 *
 * @since v0.0.12
 */
var PaymentDueTime;
exports.PaymentDueTime = PaymentDueTime;

(function (PaymentDueTime) {
  /** Payments due at the beginning of a period (1) */
  PaymentDueTime["Begin"] = "begin";
  /** Payments are due at the end of a period (0) */

  PaymentDueTime["End"] = "end"; // 0
})(PaymentDueTime || (exports.PaymentDueTime = PaymentDueTime = {}));
/**
 * Compute the future value.
 *
 * @param rate - Rate of interest as decimal (not per cent) per period
 * @param nper - Number of compounding periods
 * @param pmt - A fixed payment, paid either at the beginning or ar the end (specified by `when`)
 * @param pv - Present value
 * @param when - When payment was made
 *
 * @returns The value at the end of the `nper` periods
 *
 * @since v0.0.12
 *
 * ## Examples
 *
 * What is the future value after 10 years of saving $100 now, with
 * an additional monthly savings of $100. Assume the interest rate is
 * 5% (annually) compounded monthly?
 *
 * ```javascript
 * import { fv } from 'financial'
 *
 * fv(0.05 / 12, 10 * 12, -100, -100) // 15692.928894335748
 * ```
 *
 * By convention, the negative sign represents cash flow out (i.e. money not
 * available today).  Thus, saving $100 a month at 5% annual interest leads
 * to $15,692.93 available to spend in 10 years.
 *
 * ## Notes
 *
 * The future value is computed by solving the equation:
 *
 * ```
 * fv + pv * (1+rate) ** nper + pmt * (1 + rate * when) / rate * ((1 + rate) ** nper - 1) == 0
 * ```
 *
 * or, when `rate == 0`:
 *
 * ```
 * fv + pv + pmt * nper == 0
 * ```
 *
 * ## References
 *
 * [Wheeler, D. A., E. Rathke, and R. Weir (Eds.) (2009, May)](http://www.oasis-open.org/committees/documents.php?wg_abbrev=office-formulaOpenDocument-formula-20090508.odt).
 */


function fv(rate, nper, pmt, pv, when) {
  if (when === void 0) {
    when = PaymentDueTime.End;
  }

  var isRateZero = rate === 0;

  if (isRateZero) {
    return -(pv + pmt * nper);
  }

  var temp = Math.pow(1 + rate, nper);
  var whenMult = when === PaymentDueTime.Begin ? 1 : 0;
  return -pv * temp - pmt * (1 + rate * whenMult) / rate * (temp - 1);
}
/**
 * Compute the payment against loan principal plus interest.
 *
 * @param rate - Rate of interest (per period)
 * @param nper - Number of compounding periods (e.g., number of payments)
 * @param pv - Present value (e.g., an amount borrowed)
 * @param fv - Future value (e.g., 0)
 * @param when - When payments are due
 *
 * @returns the (fixed) periodic payment
 *
 * @since v0.0.12
 *
 * ## Examples
 *
 * What is the monthly payment needed to pay off a $200,000 loan in 15
 * years at an annual interest rate of 7.5%?
 *
 * ```javascript
 * import { pmt } from 'financial'
 *
 * pmt(0.075/12, 12*15, 200000) // -1854.0247200054619
 * ```
 *
 * In order to pay-off (i.e., have a future-value of 0) the $200,000 obtained
 * today, a monthly payment of $1,854.02 would be required.  Note that this
 * example illustrates usage of `fv` having a default value of 0.
 *
 * ## Notes
 *
 * The payment is computed by solving the equation:
 *
 * ```
 * fv + pv * (1 + rate) ** nper + pmt * (1 + rate*when) / rate * ((1 + rate) ** nper - 1) == 0
 * ```
 *
 * or, when `rate == 0`:
 *
 * ```
 * fv + pv + pmt * nper == 0
 * ```
 *
 * for `pmt`.
 *
 * Note that computing a monthly mortgage payment is only
 * one use for this function.  For example, `pmt` returns the
 * periodic deposit one must make to achieve a specified
 * future balance given an initial deposit, a fixed,
 * periodically compounded interest rate, and the total
 * number of periods.
 *
 * ## References
 *
 * [Wheeler, D. A., E. Rathke, and R. Weir (Eds.) (2009, May)](http://www.oasis-open.org/committees/documents.php?wg_abbrev=office-formulaOpenDocument-formula-20090508.odt).
 */


function pmt(rate, nper, pv, fv, when) {
  if (fv === void 0) {
    fv = 0;
  }

  if (when === void 0) {
    when = PaymentDueTime.End;
  }

  var isRateZero = rate === 0;
  var temp = Math.pow(1 + rate, nper);
  var whenMult = when === PaymentDueTime.Begin ? 1 : 0;
  var maskedRate = isRateZero ? 1 : rate;
  var fact = isRateZero ? nper : (1 + maskedRate * whenMult) * (temp - 1) / maskedRate;
  return -(fv + pv * temp) / fact;
}
/**
 * Compute the number of periodic payments.
 *
 * @param rate - Rate of interest (per period)
 * @param pmt - Payment
 * @param pv - Present value
 * @param fv - Future value
 * @param when - When payments are due
 *
 * @returns The number of periodic payments
 *
 * @since v0.0.12
 *
 * ## Examples
 *
 * If you only had $150/month to pay towards the loan, how long would it take
 * to pay-off a loan of $8,000 at 7% annual interest?
 *
 * ```javascript
 * import { nper } from 'financial'
 *
 * Math.round(nper(0.07/12, -150, 8000), 5) // 64.07335
 * ```
 *
 * So, over 64 months would be required to pay off the loan.
 *
 * ## Notes
 *
 * The number of periods `nper` is computed by solving the equation:
 *
 * ```
 * fv + pv * (1+rate) ** nper + pmt * (1+rate * when) / rate * ((1+rate) ** nper-1) = 0
 * ```
 *
 * but if `rate = 0` then:
 *
 * ```
 * fv + pv + pmt * nper = 0
 * ```
 */


function nper(rate, pmt, pv, fv, when) {
  if (fv === void 0) {
    fv = 0;
  }

  if (when === void 0) {
    when = PaymentDueTime.End;
  }

  var isRateZero = rate === 0;

  if (isRateZero) {
    return -(fv + pv) / pmt;
  }

  var whenMult = when === PaymentDueTime.Begin ? 1 : 0;
  var z = pmt * (1 + rate * whenMult) / rate;
  return Math.log((-fv + z) / (pv + z)) / Math.log(1 + rate);
}
/**
 * Compute the interest portion of a payment.
 *
 * @param rate - Rate of interest as decimal (not per cent) per period
 * @param per - Interest paid against the loan changes during the life or the loan. The `per` is the payment period to calculate the interest amount
 * @param nper - Number of compounding periods
 * @param pv - Present value
 * @param fv - Future value
 * @param when - When payments are due
 *
 * @returns Interest portion of payment
 *
 * @since v0.0.12
 *
 * ## Examples
 *
 * What is the amortization schedule for a 1 year loan of $2500 at
 * 8.24% interest per year compounded monthly?
 *
 * ```javascript
 * const principal = 2500
 * const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
 * const ipmts = periods.map((per) => f.ipmt(0.0824 / 12, per, 1 * 12, principal))
 * expect(ipmts).toEqual([
 *   -17.166666666666668,
 *   -15.789337457350777,
 *   -14.402550587464257,
 *   -13.006241114404524,
 *   -11.600343649629737,
 *   -10.18479235559687,
 *   -8.759520942678298,
 *   -7.324462666057678,
 *   -5.879550322604295,
 *   -4.424716247725826,
 *   -2.9598923121998877,
 *   -1.4850099189833388
 * ])
 * const interestpd = ipmts.reduce((a, b) => a + b, 0)
 * expect(interestpd).toBeCloseTo(-112.98308424136215, 6)
 * ```
 *
 * The `periods` variable represents the periods of the loan.  Remember that financial equations start the period count at 1!
 *
 * ## Notes
 *
 * The total payment is made up of payment against principal plus interest.
 *
 * ```
 * pmt = ppmt + ipmt
 * ```
 */


function ipmt(rate, per, nper, pv, fv, when) {
  if (fv === void 0) {
    fv = 0;
  }

  if (when === void 0) {
    when = PaymentDueTime.End;
  } // Payments start at the first period, so payments before that
  // don't make any sense.


  if (per < 1) {
    return Number.NaN;
  } // If payments occur at the beginning of a period and this is the
  // first period, then no interest has accrued.


  if (when === PaymentDueTime.Begin && per === 1) {
    return 0;
  }

  var totalPmt = pmt(rate, nper, pv, fv, when);
  var ipmtVal = _rbl(rate, per, totalPmt, pv, when) * rate; // If paying at the beginning we need to discount by one period

  if (when === PaymentDueTime.Begin && per > 1) {
    ipmtVal = ipmtVal / (1 + rate);
  }

  return ipmtVal;
}
/**
 * Compute the payment against loan principal.
 *
 * @param rate - Rate of interest (per period)
 * @param per - Amount paid against the loan changes.  The `per` is the period of interest.
 * @param nper - Number of compounding periods
 * @param pv - Present value
 * @param fv - Future value
 * @param when - When payments are due
 *
 * @returns the payment against loan principal
 *
 * @since v0.0.14
 */


function ppmt(rate, per, nper, pv, fv, when) {
  if (fv === void 0) {
    fv = 0;
  }

  if (when === void 0) {
    when = PaymentDueTime.End;
  }

  var total = pmt(rate, nper, pv, fv, when);
  return total - ipmt(rate, per, nper, pv, fv, when);
}
/**
 * Calculates the present value of an annuity investment based on constant-amount
 * periodic payments and a constant interest rate.
 *
 * @param rate - Rate of interest (per period)
 * @param nper - Number of compounding periods
 * @param pmt - Payment
 * @param fv - Future value
 * @param when - When payments are due
 *
 * @returns the present value of a payment or investment
 *
 * @since v0.0.15
 *
 * ## Examples
 *
 * What is the present value (e.g., the initial investment)
 * of an investment that needs to total $15692.93
 * after 10 years of saving $100 every month?  Assume the
 * interest rate is 5% (annually) compounded monthly.
 *
 * ```javascript
 * import { pv } from 'financial'
 *
 * pv(0.05/12, 10*12, -100, 15692.93) // -100.00067131625819
 * ```
 *
 * By convention, the negative sign represents cash flow out
 * (i.e., money not available today).  Thus, to end up with
 * $15,692.93 in 10 years saving $100 a month at 5% annual
 * interest, one's initial deposit should also be $100.
 *
 * ## Notes
 *
 * The present value is computed by solving the equation:
 *
 * ```
 * fv + pv * (1 + rate) ** nper + pmt * (1 + rate * when) / rate * ((1 + rate) ** nper - 1) = 0
 * ```
 *
 * or, when `rate = 0`:
 *
 * ```
 * fv + pv + pmt * nper = 0
 * ```
 *
 * for `pv`, which is then returned.
 *
 * ## References
 *
 * [Wheeler, D. A., E. Rathke, and R. Weir (Eds.) (2009, May)](http://www.oasis-open.org/committees/documents.php?wg_abbrev=office-formulaOpenDocument-formula-20090508.odt).
 */


function pv(rate, nper, pmt, fv, when) {
  if (fv === void 0) {
    fv = 0;
  }

  if (when === void 0) {
    when = PaymentDueTime.End;
  }

  var whenMult = when === PaymentDueTime.Begin ? 1 : 0;
  var isRateZero = rate === 0;
  var temp = Math.pow(1 + rate, nper);
  var fact = isRateZero ? nper : (1 + rate * whenMult) * (temp - 1) / rate;
  return -(fv + pmt * fact) / temp;
}
/**
 * Compute the rate of interest per period
 *
 * @param nper - Number of compounding periods
 * @param pmt - Payment
 * @param pv - Present value
 * @param fv - Future value
 * @param when - When payments are due ('begin' or 'end')
 * @param guess - Starting guess for solving the rate of interest
 * @param tol - Required tolerance for the solution
 * @param maxIter - Maximum iterations in finding the solution
 *
 * @returns the rate of interest per period (or `NaN` if it could
 *  not be computed within the number of iterations provided)
 *
 * @since v0.0.16
 *
 * ## Notes
 *
 * Use Newton's iteration until the change is less than 1e-6
 * for all values or a maximum of 100 iterations is reached.
 * Newton's rule is:
 *
 * ```
 * r_{n+1} = r_{n} - g(r_n)/g'(r_n)
 * ```
 *
 * where:
 *
 * - `g(r)` is the formula
 * - `g'(r)` is the derivative with respect to r.
 *
 *
 * The rate of interest is computed by iteratively solving the
 * (non-linear) equation:
 *
 * ```
 * fv + pv * (1+rate) ** nper + pmt * (1+rate * when) / rate * ((1+rate) ** nper - 1) = 0
 * ```
 *
 * for `rate.
 *
 * ## References
 *
 * [Wheeler, D. A., E. Rathke, and R. Weir (Eds.) (2009, May)](http://www.oasis-open.org/committees/documents.php?wg_abbrev=office-formulaOpenDocument-formula-20090508.odt).
 */


function rate(nper, pmt, pv, fv, when, guess, tol, maxIter) {
  if (when === void 0) {
    when = PaymentDueTime.End;
  }

  if (guess === void 0) {
    guess = 0.1;
  }

  if (tol === void 0) {
    tol = 1e-6;
  }

  if (maxIter === void 0) {
    maxIter = 100;
  }

  var rn = guess;
  var iterator = 0;
  var close = false;

  while (iterator < maxIter && !close) {
    var rnp1 = rn - _gDivGp(rn, nper, pmt, pv, fv, when);

    var diff = Math.abs(rnp1 - rn);
    close = diff < tol;
    iterator++;
    rn = rnp1;
  } // if exausted all the iterations and the result is not
  // close enough, returns `NaN`


  if (!close) {
    return Number.NaN;
  }

  return rn;
}
/**
 * Return the Internal Rate of Return (IRR).
 *
 * This is the "average" periodically compounded rate of return
 * that gives a net present value of 0.0; for a more complete
 * explanation, see Notes below.
 *
 * @param values - Input cash flows per time period.
 *   By convention, net "deposits"
 *   are negative and net "withdrawals" are positive.  Thus, for
 *   example, at least the first element of `values`, which represents
 *   the initial investment, will typically be negative.
 * @param guess - Starting guess for solving the Internal Rate of Return
 * @param tol - Required tolerance for the solution
 * @param maxIter - Maximum iterations in finding the solution
 *
 * @returns Internal Rate of Return for periodic input values
 *
 * @since v0.0.17
 *
 * ## Notes
 *
 * The IRR is perhaps best understood through an example (illustrated
 * using `irr` in the Examples section below).
 *
 * Suppose one invests 100
 * units and then makes the following withdrawals at regular (fixed)
 * intervals: 39, 59, 55, 20.  Assuming the ending value is 0, one's 100
 * unit investment yields 173 units; however, due to the combination of
 * compounding and the periodic withdrawals, the "average" rate of return
 * is neither simply 0.73/4 nor (1.73)^0.25-1.
 * Rather, it is the solution (for `r`) of the equation:
 *
 * ```
 * -100 + 39/(1+r) + 59/((1+r)^2) + 55/((1+r)^3) + 20/((1+r)^4) = 0
 * ```
 *
 * In general, for `values` = `[0, 1, ... M]`,
 * `irr` is the solution of the equation:
 *
 * ```
 * \\sum_{t=0}^M{\\frac{v_t}{(1+irr)^{t}}} = 0
 * ```
 *
 * ## Example
 *
 * ```javascript
 * import { irr } from 'financial'
 *
 * irr([-100, 39, 59, 55, 20]) // 0.28095
 * irr([-100, 0, 0, 74]) // -0.0955
 * irr([-100, 100, 0, -7]) // -0.0833
 * irr([-100, 100, 0, 7]) // 0.06206
 * irr([-5, 10.5, 1, -8, 1]) // 0.0886
 * ```
 *
 * ## References
 *
 * - L. J. Gitman, "Principles of Managerial Finance, Brief," 3rd ed.,
 *  Addison-Wesley, 2003, pg. 348.
 */


function irr(values, guess, tol, maxIter) {
  if (guess === void 0) {
    guess = 0.1;
  }

  if (tol === void 0) {
    tol = 1e-6;
  }

  if (maxIter === void 0) {
    maxIter = 100;
  } // Based on https://gist.github.com/ghalimi/4591338 by @ghalimi
  // ASF licensed (check the link for the full license)
  // Credits: algorithm inspired by Apache OpenOffice
  // Initialize dates and check that values contains at
  // least one positive value and one negative value


  var dates = [];
  var positive = false;
  var negative = false;

  for (var i = 0; i < values.length; i++) {
    dates[i] = i === 0 ? 0 : dates[i - 1] + 365;

    if (values[i] > 0) {
      positive = true;
    }

    if (values[i] < 0) {
      negative = true;
    }
  } // Return error if values does not contain at least one positive
  // value and one negative value


  if (!positive || !negative) {
    return Number.NaN;
  } // Initialize guess and resultRate


  var resultRate = guess; // Implement Newton's method

  var newRate, epsRate, resultValue;
  var iteration = 0;
  var contLoop = true;

  do {
    resultValue = _irrResult(values, dates, resultRate);
    newRate = resultRate - resultValue / _irrResultDeriv(values, dates, resultRate);
    epsRate = Math.abs(newRate - resultRate);
    resultRate = newRate;
    contLoop = epsRate > tol && Math.abs(resultValue) > tol;
  } while (contLoop && ++iteration < maxIter);

  if (contLoop) {
    return Number.NaN;
  } // Return internal rate of return


  return resultRate;
}
/**
 * Returns the NPV (Net Present Value) of a cash flow series.
 *
 * @param rate - The discount rate
 * @param values - The values of the time series of cash flows.  The (fixed) time
 * interval between cash flow "events" must be the same as that for
 * which `rate` is given (i.e., if `rate` is per year, then precisely
 * a year is understood to elapse between each cash flow event).  By
 * convention, investments or "deposits" are negative, income or
 * "withdrawals" are positive; `values` must begin with the initial
 * investment, thus `values[0]` will typically be negative.
 * @returns The NPV of the input cash flow series `values` at the discount `rate`.
 *
 * @since v0.0.18
 *
 * ## Warnings
 *
 * `npv considers a series of cashflows starting in the present (t = 0).
 * NPV can also be defined with a series of future cashflows, paid at the
 * end, rather than the start, of each period. If future cashflows are used,
 * the first cashflow `values[0]` must be zeroed and added to the net
 * present value of the future cashflows. This is demonstrated in the
 * examples.
 *
 * ## Notes
 *
 * Returns the result of:
 *
 * ```
 * \\sum_{t=0}^{M-1}{\\frac{values_t}{(1+rate)^{t}}}
 * ```
 *
 * ## Examples
 *
 * Consider a potential project with an initial investment of $40 000 and
 * projected cashflows of $5 000, $8 000, $12 000 and $30 000 at the end of
 * each period discounted at a rate of 8% per period. To find the project's
 * net present value:
 *
 * ```javascript
 * import {npv} from 'financial'
 *
 * const rate = 0.08
 * const cashflows = [-40_000, 5000, 8000, 12000, 30000]
 * npv(rate, cashflows) // 3065.2226681795255
 * ```
 *
 * It may be preferable to split the projected cashflow into an initial
 * investment and expected future cashflows. In this case, the value of
 * the initial cashflow is zero and the initial investment is later added
 * to the future cashflows net present value:
 *
 * ```javascript
 * const initialCashflow = cashflows[0]
 * cashflows[0] = 0
 *
 * npv(rate, cashflows) + initialCashflow // 3065.2226681795255
 * ```
 *
 * ## References
 *
 * L. J. Gitman, "Principles of Managerial Finance, Brief,"
 * 3rd ed., Addison-Wesley, 2003, pg. 346.
 */


function npv(rate, values) {
  return values.reduce(function (acc, curr, i) {
    return acc + curr / Math.pow(1 + rate, i);
  }, 0);
}
/**
 * Calculates the Modified Internal Rate of Return.
 *
 * @param values - Cash flows (must contain at least one positive and one negative
 *   value) or nan is returned.  The first value is considered a sunk
 *   cost at time zero.
 * @param financeRate - Interest rate paid on the cash flows
 * @param reinvestRate - Interest rate received on the cash flows upon reinvestment
 *
 * @returns Modified internal rate of return
 *
 * @since v0.1.0
 */


function mirr(values, financeRate, reinvestRate) {
  var positive = false;
  var negative = false;

  for (var i = 0; i < values.length; i++) {
    if (values[i] > 0) {
      positive = true;
    }

    if (values[i] < 0) {
      negative = true;
    }
  } // Return error if values does not contain at least one
  // positive value and one negative value


  if (!positive || !negative) {
    return Number.NaN;
  }

  var numer = Math.abs(npv(reinvestRate, values.map(function (x) {
    return x > 0 ? x : 0;
  })));
  var denom = Math.abs(npv(financeRate, values.map(function (x) {
    return x < 0 ? x : 0;
  })));
  return Math.pow(numer / denom, 1 / (values.length - 1)) * (1 + reinvestRate) - 1;
}
/**
 * This function is here to simply have a different name for the 'fv'
 * function to not interfere with the 'fv' keyword argument within the 'ipmt'
 * function.  It is the 'remaining balance on loan' which might be useful as
 * it's own function, but is easily calculated with the 'fv' function.
 *
 * @private
 */


function _rbl(rate, per, pmt, pv, when) {
  return fv(rate, per - 1, pmt, pv, when);
}
/**
 * Evaluates `g(r_n)/g'(r_n)`, where:
 *
 * ```
 * g = fv + pv * (1+rate) ** nper + pmt * (1+rate * when)/rate * ((1+rate) ** nper - 1)
 * ```
 *
 * @private
 */


function _gDivGp(r, n, p, x, y, when) {
  var w = when === PaymentDueTime.Begin ? 1 : 0;
  var t1 = Math.pow(r + 1, n);
  var t2 = Math.pow(r + 1, n - 1);
  var g = y + t1 * x + p * (t1 - 1) * (r * w + 1) / r;
  var gp = n * t2 * x - p * (t1 - 1) * (r * w + 1) / Math.pow(r, 2) + n * p * t2 * (r * w + 1) / r + p * (t1 - 1) * w / r;
  return g / gp;
}
/**
 * Calculates the resulting amount.
 *
 * Based on https://gist.github.com/ghalimi/4591338 by @ghalimi
 * ASF licensed (check the link for the full license)
 *
 * @private
 */


function _irrResult(values, dates, rate) {
  var r = rate + 1;
  var result = values[0];

  for (var i = 1; i < values.length; i++) {
    result += values[i] / Math.pow(r, (dates[i] - dates[0]) / 365);
  }

  return result;
}
/**
 * Calculates the first derivation
 *
 * Based on https://gist.github.com/ghalimi/4591338 by @ghalimi
 * ASF licensed (check the link for the full license)
 *
 * @private
 */


function _irrResultDeriv(values, dates, rate) {
  var r = rate + 1;
  var result = 0;

  for (var i = 1; i < values.length; i++) {
    var frac = (dates[i] - dates[0]) / 365;
    result -= frac * values[i] / Math.pow(r, frac + 1);
  }

  return result;
}
},{}],"cfviz.js":[function(require,module,exports) {
"use strict";

var _financial = require("financial");

//remix icon
var coinHtml = "\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"18\" height=\"18\"><path fill=\"none\" d=\"M0 0h24v24H0z\"/><path d=\"M12 4c6.075 0 11 2.686 11 6v4c0 3.314-4.925 6-11 6-5.967 0-10.824-2.591-10.995-5.823L1 14v-4c0-3.314 4.925-6 11-6zm0 12c-3.72 0-7.01-1.007-9-2.55V14c0 1.882 3.883 4 9 4 5.01 0 8.838-2.03 8.995-3.882L21 14l.001-.55C19.011 14.992 15.721 16 12 16zm0-10c-5.117 0-9 2.118-9 4 0 1.882 3.883 4 9 4s9-2.118 9-4c0-1.882-3.883-4-9-4z\"/></svg>\n"; //DOM

var inflow = document.querySelector('.inflow');
var outflow = document.querySelector('.outflow');
var paidToDate = document.querySelector('.paid-to-date');
var submit = document.querySelector('.submit');
var chevron = document.querySelector('.chevron');
var loanAmount = document.querySelector('[name="loanAmount"]');
var origDate = document.querySelector('[name="origDate"]');
var interestRate = document.querySelector('[name="interestRate"]');
var lengthMonths = document.querySelector('[name="lengthMonths"]');
var incomeYears = document.querySelector('[name="income"]');
var form = document.querySelector('.flex-form');
var timePayments = {};
var timeIncome = {};
var currentTime = Date.now();
console.log(currentTime);
console.log(new Date(origDate.value).getTime()); //Handle Input

function handleInput(e) {
  e.preventDefault();
  var payment = (0, _financial.pmt)(interestRate.value / 1200, lengthMonths.value, parseFloat(loanAmount.value.replace(/\$|,/g, '')));
  console.log(payment);
  timePayments = {
    second: payment * 12 / 365.25 / 24 / 60 / 60,
    minute: payment * 12 / 365.25 / 24 / 60,
    hour: payment * 12 / 365.25 / 24,
    day: payment * 12 / 365.25,
    week: payment * 12 / 365.25 * 7,
    month: payment,
    year: payment * 12,
    total: payment * lengthMonths.value
  };
  var income = incomeYears.value;
  timeIncome = {
    second: income / 365.25 / 24 / 60 / 60,
    minute: income / 365.25 / 24 / 60,
    hour: income / 365.25 / 24,
    day: income / 365.25,
    week: income / 365.25 * 7,
    month: income / 12,
    year: income
  };
  console.log(timePayments.second);
  var timePassed = (Date.now() - new Date(origDate.value).getTime()) / 1000;
  timePayments.toDate = timePayments.second * timePassed;
  console.log(timePayments.toDate);
  setInterval(function () {
    timePassed = (Date.now() - new Date(origDate.value).getTime()) / 1000;
    timePayments.toDate = timePayments.second * timePassed;
    updateAmount(timePayments);
  }, 1000);
  timePayments.delay = -1000 * (.01 + timePayments.toDate % .01) / timePayments.second;
  console.log(timePayments.delay);
  animateFlow(timePayments);
}

function updateAmount() {
  var html = "\n    <span class=\"toDatePaid\">".concat(timePayments.toDate.toFixed(5), "</span>");
  paidToDate.innerHTML = html;
} //Financial Calcs


function animateFlow() {
  inflow.innerHTML = coinHtml;
  setTimeout(function () {
    outflow.innerHTML = coinHtml;
  }, timePayments.delay);
  var inflowDuration = 10 / timeIncome.second;
  var outflowDuration = 10 / -timePayments.second;
  inflow.animate([//keyframes
  {
    transform: 'translateY(-15vh)'
  }, {
    transform: 'translateY(12vh)'
  }], {
    //timing options
    duration: inflowDuration,
    iterations: Infinity
  });
  outflow.animate([//keyframes
  {
    transform: 'translateY(-12vh'
  }, {
    transform: 'translateY(15vh)'
  }], {
    //timing options
    delay: timePayments.delay,
    duration: outflowDuration,
    iterations: Infinity
  });
}

function toggleView(e) {
  e.preventDefault();

  if (chevron.classList.contains('fa-chevron-down')) {
    window.scrollTo({
      left: 0,
      top: document.body.scrollHeight,
      behavior: "smooth"
    });
    chevron.classList.remove('fa-chevron-down');
    chevron.classList.add('fa-chevron-up');
    return;
  }

  window.scrollTo({
    left: 0,
    top: 0,
    behavior: "smooth"
  });
  chevron.classList.remove('fa-chevron-up');
  chevron.classList.add('fa-chevron-down');
} //Event Listeners


form.addEventListener('input', handleInput);
submit.addEventListener('click', toggleView); //form.addEventListener('formUpdated', showResults);
},{"financial":"node_modules/financial/dist/financial.esm.js"}],"../../../../AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "54281" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","cfviz.js"], null)
//# sourceMappingURL=/cfviz.df5e08f6.js.map