import { pmt } from 'financial';

//remix icon
const coinHtml = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 4c6.075 0 11 2.686 11 6v4c0 3.314-4.925 6-11 6-5.967 0-10.824-2.591-10.995-5.823L1 14v-4c0-3.314 4.925-6 11-6zm0 12c-3.72 0-7.01-1.007-9-2.55V14c0 1.882 3.883 4 9 4 5.01 0 8.838-2.03 8.995-3.882L21 14l.001-.55C19.011 14.992 15.721 16 12 16zm0-10c-5.117 0-9 2.118-9 4 0 1.882 3.883 4 9 4s9-2.118 9-4c0-1.882-3.883-4-9-4z"/></svg>
`;
//DOM
const inflow = document.querySelector('.inflow');
const outflow = document.querySelector('.outflow');
const paidToDate = document.querySelector('.paid-to-date');

const submit = document.querySelector('.submit');
const chevron = document.querySelector('.chevron');
let loanAmount = document.querySelector('[name="loanAmount"]');
let origDate = document.querySelector('[name="origDate"]');
let interestRate = document.querySelector('[name="interestRate"]');
let lengthMonths = document.querySelector('[name="lengthMonths"]');
let incomeYears = document.querySelector('[name="income"]');

const form = document.querySelector('.flex-form');

let timePayments = {};
let timeIncome = {};
let currentTime = Date.now();
console.log(currentTime);

console.log(new Date(origDate.value).getTime());

//Handle Input
function handleInput(e){
    e.preventDefault();
    let payment = pmt(interestRate.value/1200, lengthMonths.value, 
        parseFloat(loanAmount.value.replace(/\$|,/g, '')));
        console.log(payment);
    timePayments = {
        second: payment * 12 / 365.25 / 24 / 60 / 60,
        minute: payment * 12 / 365.25 / 24 / 60,
        hour: payment * 12 / 365.25 / 24,
        day: payment * 12 / 365.25,
        week: payment * 12 / 365.25 * 7,
        month: payment,
        year: payment * 12,
        total: payment * lengthMonths.value,
    }
    let income = incomeYears.value;
    timeIncome = {
        second: income / 365.25 / 24 / 60 / 60,
        minute: income / 365.25 / 24 / 60,
        hour: income / 365.25 / 24,
        day: income / 365.25,
        week: income / 365.25 * 7,
        month: income / 12,
        year: income
    }
    console.log(timePayments.second);

    let timePassed = (Date.now()-new Date(origDate.value).getTime())/1000;
    timePayments.toDate = timePayments.second * timePassed;
    console.log(timePayments.toDate);
    setInterval(function(){
        timePassed = (Date.now()-new Date(origDate.value).getTime())/1000;
        timePayments.toDate = timePayments.second * timePassed;
        updateAmount(timePayments);
    }, 1000);
    timePayments.delay = -1000*(.01 + (timePayments.toDate % .01))/ timePayments.second;
    console.log(timePayments.delay);
    animateFlow(timePayments);    
}

function updateAmount(){
    
    const html = `
    <span class="toDatePaid">${timePayments.toDate.toFixed(5)}</span>`;
    paidToDate.innerHTML = html;
}


//Financial Calcs
function animateFlow() {
    inflow.innerHTML = coinHtml;
    setTimeout(function() {
        outflow.innerHTML = coinHtml;
    }, timePayments.delay);

    const inflowDuration = 10/timeIncome.second;
    const outflowDuration = 10/-(timePayments.second);
    
    inflow.animate([
        //keyframes
        { transform: 'translateY(-15vh)'},
        { transform: 'translateY(12vh)'}
    ], {
        //timing options
        duration: inflowDuration,
        iterations: Infinity,
    });
    
    outflow.animate([
        //keyframes
        { transform: 'translateY(-12vh'},
        { transform: 'translateY(15vh)'}
    ], {
        //timing options
        delay: timePayments.delay,
        duration: outflowDuration,
        iterations: Infinity,
    });
    
}

function toggleView(e){
    e.preventDefault();
    if(chevron.classList.contains('fa-chevron-down'))
    {
        window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });
        chevron.classList.remove('fa-chevron-down');
        chevron.classList.add('fa-chevron-up');
        return;
    }
        window.scrollTo({ left: 0, top: 0, behavior: "smooth" });
        chevron.classList.remove('fa-chevron-up');
        chevron.classList.add('fa-chevron-down');
}

//Event Listeners
form.addEventListener('input', handleInput);
submit.addEventListener('click', toggleView);

//form.addEventListener('formUpdated', showResults);