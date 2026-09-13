/* Educational monthly model. No network, storage, or analytics. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SH_HELOC_PLANNING=factory();})(typeof self!=='undefined'?self:this,function(){
'use strict';
function num(n,min,max){if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max)throw new RangeError('Invalid assumption');return n;}
function payment(balance,rate,months){num(balance,0,1.1e8);num(rate,0,100);num(months,1,600);if(!Number.isInteger(months))throw new RangeError('Whole months required');var r=rate/1200;return r===0?balance/months:balance*r/(-Math.expm1(-months*Math.log1p(r)));}
function simulate(o){
 var amount=num(o.amount,1,1e8),rate=num(o.rate,0,100),draw=num(o.drawMonths,0,240),repay=num(o.repayMonths,1,360),horizon=num(o.horizon,1,600),fees=num(o.fees,0,1e7),change=num(o.changeMonth,1,600),later=num(o.laterRate,0,100);
 [draw,repay,horizon,change].forEach(function(x){if(!Number.isInteger(x))throw new RangeError('Whole months required');});
 var balance=amount+(o.financeFees?fees:0),interest=0,paid=0,first=0,firstRepayment=null,maxPayment=0,rows=[];
 for(var month=1;month<=horizon;month++){
  var current=month>=change?later:rate;var due=balance*current/1200;
  var scheduled=month<=draw?due:(balance>0?payment(balance,current,Math.max(1,draw+repay-month+1)):0);
  var actual=Math.min(balance+due,scheduled);var principal=Math.max(0,actual-due);balance=Math.max(0,balance-principal);if(balance<1e-7)balance=0;
  interest+=due;paid+=actual;if(month===1)first=actual;if(month===draw+1)firstRepayment=actual;maxPayment=Math.max(maxPayment,actual);
  rows.push({month,rate:current,payment:actual,interest:due,balance});
 }
 return {firstPayment:first,firstRepayment,maxPayment,interest,paid,balance,upfront:o.financeFees?0:fees,cost:interest+fees,totalCommitmentAtHorizon:paid+balance+(o.financeFees?0:fees),rows};
}
function plan(costs,initialDraw,limit){if(!Array.isArray(costs)||costs.length!==4)throw new RangeError('Four stages required');costs.forEach(n=>num(n,0,1e8));num(initialDraw,0,1e8);num(limit,0,1e8);var total=costs.reduce((a,b)=>a+b,0);return {total,now:costs[0],later:total-costs[0],gap:Math.max(0,total-limit),unusedInitial:Math.max(0,initialDraw-costs[0]),initialShortfall:Math.max(0,costs[0]-initialDraw),initialExceedsLimit:initialDraw>limit};}
return {payment,simulate,plan};
});
