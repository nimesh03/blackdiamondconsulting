$(document).ready(function(){var i,l,u,e=$(".bar"),o=$(".special-missions-slide"),n=$(".special-missions-slide").length,s=[],d=$("#sm_contact");function a(t){"prev"===t&&(i=f(),prevInd=i,_(--i),c(prevInd,i,100)),"next"===t&&(i=f(),prevInd=i,_(i+=1),c(prevInd,i,-100))}function c(t,i){o.removeClass("active"),e.removeClass("active-bar"),$(".slide-"+i).addClass("active"),$("#bar"+i).addClass("active-bar")}function r(){i=1,e.first().addClass("active-bar"),o.first().addClass("active")}function _(t){n<t&&r(),t<1&&(i=n,$("#bar"+n).addClass("active-bar"),$(".slide-"+n).addClass("active"))}function f(){return parseInt($(".active-bar").attr("id").slice(3,5))}$("#next").on("click",function(){a("next")}),$("#prev").on("click",function(){a("prev")}),$(".special-missions-slide").on("touchstart touchend touchmove",function(t){return t.preventDefault(),"touchstart"==t.type?(touchPositionStart=t.touches[0].clientX,touchPositionStart):"touchmove"==t.type?(s.push(t.originalEvent.changedTouches[0].clientX),s):void("touchend"==t.type&&(touchPositionEnd=s.pop(),1<s.length&&(touchPositionDiff=touchPositionEnd-touchPositionStart,40<=touchPositionDiff&&a("prev"),touchPositionDiff<=-40&&a("next"))))}),$(".special-missions-slide").on("mouseclick mousedown mouseup",function(t){if(t.preventDefault(),"mousedown"===t.type)return positionStart=t.originalEvent.clientX,positionStart;"mouseup"===t.type&&(positionEnd=t.originalEvent.clientX,positionDiff=positionStart-positionEnd,40<=positionDiff&&a("next"),positionDiff<=-40&&a("prev"))}),$(".bar").on("click",function(){var t=$(this).data("index");$(".special-missions-slide").each(function(t){$(this).removeClass("active")}),$(".bar").each(function(t){$(this).removeClass("active-bar")}),$(".special-missions-slide[data-index='"+t+"']").addClass("active"),$(".bar[data-index='"+t+"']").addClass("active-bar")}),r(),$.get("https://thedotcom-data.s3.amazonaws.com/contacts.json").done(function(t){l=[];for(var i=0;i<t.length;i++)"government"==t[i].Division__c.toLowerCase()&&("regional vice president"==t[i].Title__c.toLowerCase()?u=t[i]:l.push(t[i]));l=l.sort(function(t,i){return t.Last_Name__c<i.Last_Name__c?-1:t.Last_Name__c>i.Last_Name__c?1:0}),u&&l.unshift(u);for(var e=0;e<l.length;e++){var o=l[e].First_Name__c+" "+l[e].Last_Name__c,n=l[e].Title__c,s=l[e].Sales_Territory__c,a=l[e].Mobile__c,c=l[e].Phone__c,r=l[e].Email__c;mobile_number_html=a?"<li>Mobile: "+a+"</li>":"",office_number_html=c?"<li>Office: "+c+"</li>":"",d.append('<div class="preowned__contact preowned__contact--two"><h1>'+o+"</h1><h2>"+n+"</h2><h3>"+s+"</h3><ul>"+mobile_number_html+office_number_html+'<li><a href="mailto:'+r+'?subject=Gulfstream%20Special%20Missions%20Inquiry">'+r+"</a></li></ul></div>")}}).fail(function(t){console.log("error:",t)})});