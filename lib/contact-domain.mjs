export const enquiryTopics=['Choosing a set','My saved order','Delivery and returns','Something else'];
export function validateEnquiry(raw){const entry={name:"",mobile:"",email:"",topic:"",message:""};for(const key of ['name','mobile','email','topic','message'])entry[key]=typeof raw?.[key]==='string'?raw[key].trim():'';
 if(entry.name.length<2||entry.name.length>120)throw new Error('Please enter your name.');
 if(!/^[6-9]\d{9}$/.test(entry.mobile))throw new Error('Please enter a valid 10-digit mobile number.');
 if(entry.email&&(entry.email.length>150||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email)))throw new Error('Please check your email address.');
 if(!enquiryTopics.includes(entry.topic))throw new Error('Please choose what you need help with.');
 if(entry.message.length<10||entry.message.length>2000)throw new Error('Please write a message between 10 and 2,000 characters.');return entry;
}
