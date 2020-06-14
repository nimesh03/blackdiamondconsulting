location.hash&&setTimeout(function(){window.scrollTo(0,0)},1);var lang=document.querySelector("html").getAttribute("lang"),translations=window._DATA.lang[lang].preowned,contacts=[],nonVP=[],divisions=[];axios.get("https://thedotcom-data.s3.amazonaws.com/contacts.json").then(function(t){for(var a=0;a<t.data.length;a++)divisions.push(t.data[a].Division__c),"pre owned aircraft"!==t.data[a].Division__c.toLowerCase()&&"pre-owned aircraft"!==t.data[a].Division__c.toLowerCase()&&"preowned aircraft"!==t.data[a].Division__c.toLowerCase()||(-1<t.data[a].Title__c.toLowerCase().indexOf("vice president")||-1<t.data[a].Title__c.toLowerCase().indexOf("vice-president")?contacts.push(t.data[a]):nonVP.push(t.data[a]));contacts=contacts.sort(function(t,a){return t.Last_Name__c>a.Last_Name__c?1:t.Last_Name__c<a.Last_Name__c?-1:0}),nonVP=nonVP.sort(function(t,a){return t.Last_Name__c>a.Last_Name__c?1:t.Last_Name__c<a.Last_Name__c?-1:0}),contacts=contacts.concat(nonVP);for(a=0;a<contacts.length;a++){var e=(translations[contacts[a].Title__c]?translations[contacts[a].Title__c]:contacts[a].Title__c).split(","),n=' <div class="preowned__contact">     <h1>'+contacts[a].First_Name__c+" "+contacts[a].Last_Name__c+"</h1>         <h2>"+e[0]+"</h2>";1<e.length&&(n+="<h2>"+e[1]+"</h2>"),contacts[a].Sales_Territory__c&&(n+="<h3>"+(translations[contacts[a].Sales_Territory__c]?translations[contacts[a].Sales_Territory__c]:contacts[a].Sales_Territory__c)+"</h3>"),n+="<ul>",contacts[a].Phone__c&&(n+="<li>"+(translations.office?translations.office:"Office")+": "+contacts[a].Phone__c+"</li>"),contacts[a].Mobile__c&&(n+="<li>"+(translations.mobile?translations.mobile:"Mobile")+": "+contacts[a].Mobile__c+"</li>"),contacts[a].Email__c&&(n+='<li><a href="mailto:'+contacts[a].Email__c+"?subject="+(translations.email_subject?translations.email_subject:"Gulfstream%20Pre-Owned%20Inquiry")+'">'+contacts[a].Email__c+"</a></li>"),n+="</ul></div>",document.querySelector("#contacts").innerHTML+=n}}).catch(function(t){console.log("Error fetching contacts:",t)}),Vue.component("preowned-aircraft",{props:["plane"],data:function(){return{elem:"",flkty:"",paid:"pa-"+this.plane.id,labelClass:"preowned__tag",anchorInputId:"copy_"+this.plane.serial,buttonInputId:"copybutton_"+this.plane.serial,showShare:!1,anchor:location.href.replace(location.hash,"")+"#"+this.plane.serial,exteriorLabel:translations?translations.caption.exterior:this.exteriorTextDefault,downloadLabel:translations?translations.download:this.downloadSpecsTextDefault,copyText:translations.copy,copiedText:translations.copied,shareImageTooltip:translations.share_image,exteriorTextDefault:translations.caption.exterior,downloadSpecsTextDefault:translations.download_specs}},template:' <section class="preowned__section">   <a class="preowned__anchor" :name="plane.serial" :id="plane.serial"></a>   <div class="preowned__images">     <div :class="[labelClass, plane.class]">       <span v-text="plane.label"></span>     </div>     <div class="preowned__share">       <div class="preowned__shareform" v-show="showShare">         <input type="text" @focus="$event.target.select()" :value="anchor" :id="this.anchorInputId" />         <button type="button" @click="copyAll()" :id="this.buttonInputId" v-text="copyText"></button>       </div>       <a nohref @click="toggleShareForm()"><img class="preowned__sharebtn" src="/buttons/share-w.svg" :title="shareImageTooltip"/></a>     </div>     <div class="preowned__carousel" v-bind:id="this.paid">       <div class="preowned__image">         <img v-bind:data-flickity-lazyload="plane.exteriorImage" v-bind:alt="plane.exteriorDesc" />         <p v-text="exteriorLabel"></p>       </div>       <div class="preowned__image" v-for="image in plane.images">         <img v-bind:data-flickity-lazyload="image.image" v-bind:alt="image.description" />         <p v-text="image.description"></p>       </div>     </div>   </div>   <div class="preowned__stats">     <h4 v-text="plane.modelYear"></h4>     <h2 v-html="plane.title"></h2>     <div>       <p v-text="plane.galleyLocation"></p>       <p v-text="plane.passengers"></p>       <p v-text="plane.hours"></p>       <p v-text="plane.engineProgram"></p>       <p v-text="plane.price"></p>       <a v-bind:href="plane.eBrochure" target="_blank" v-text="downloadLabel"></a>     </div>   </div> </section>',mounted:function(){this.elem=document.querySelector("#"+this.paid),this.flkty=new Flickity(this.elem,{wrapAround:!0,prevNextButtons:!1,setGallerySize:!1,lazyLoad:!0,fullscreen:!0})},methods:{toggleShareForm:function(){this.showShare=!this.showShare},copyAll:function(){copyText=document.getElementById(this.anchorInputId),copyButton=document.getElementById(this.buttonInputId),copyText.select(),document.execCommand("copy"),copyButton.innerHTML=this.copiedText}}});var vm=new Vue({el:"#preowned",data:{planes:[]},updated:function(){location.hash&&(document.location.href=location.href)},created:function(){that=this,axios.get("https://api.gulfstream.aero/ddb?operation=list&table=arukslsk&filter=-aircraftStatus:Draft,Closed").then(function(t){for(i=0;i<t.data.length;i++){if(rd=t.data[i],"en"!=lang)for(var a=0;a<rd.images.length;a++)if(translations){var e=rd.images[a].description,n=e?e.toLowerCase():"";rd.images[a].description=translations.caption[n]?translations.caption[n]:""}else rd.images[a].description="";plane={id:rd.id,serial:rd.serial,model:rd.model,title:rd.model+(translations?" "+translations.serial:" S/N")+"&nbsp;"+rd.serial,status:rd.aircraftStatus,exteriorImage:rd.exteriorImage,exteriorDesc:"Exterior image of "+rd.model,images:rd.images,modelYear:(translations?translations.model_year+": ":"Model Year:")+rd.modelYear,galleyLocation:(translations?translations.galley+": ":"Galley:")+(translations?"Forward"==rd.galleyLocation?translations.forward:"Aft"==rd.galleyLocation?translations.aft:rd.galleyLocation:rd.galleyLocation),passengers:(translations?translations.passenger_count+": ":"Passenger count: ")+rd.passengers,hours:(translations?translations.total_time+": ":"Total time: ")+("ru"!=lang?rd.hours:rd.hours.replace(/,/g,""))+(translations?" "+translations.hours:" hours"),engineProgram:(translations?translations.engine_program+": ":"Engine Program: ")+(rd.engineProgram?translations?translations.yes:"Yes":translations?translations.no:"No"),price:(translations?translations.price+": ":"Asking price: ")+("ru"!=lang?rd.price:rd.price.replace(/,/g,""))+" USD",eBrochure:rd.eBrochure},"Sold"===rd.aircraftStatus?(plane.class="preowned__tag--sold",plane.label=translations.statuses.sold):"Sale Pending"===rd.aircraftStatus?(plane.class="preowned__tag--salepending",plane.label=translations.statuses.sale_pending):(plane.class="",plane.label=""),that.planes.push(plane)}})}});