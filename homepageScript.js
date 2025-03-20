const url = "https://dev-93076686-admin.okta.com/api/v1/users";
const token = "00CwZ9HwAqbM2r2stUe9pOStTJBuWM3q_jOxeYVroA";
let userid;

const options = [
    {"Basic":["okta verify"]},
    {"Premium":["okta verify","google authenticator"]},
    {"Premium Plus":["okta verify","google authenticator","email"]}
]

const arr = ["okta","google","email"];

let plans;
console.log(plans)



const logId = document.getElementById("login");
const email=document.getElementById("email"); 
const mobile=document.getElementById("mobile");
const city=document.getElementById("city");
const state=document.getElementById("state");
const country=document.getElementById("countryCode");
const subscribe=document.getElementById("subscription");
const login2=document.getElementById("login2");

if (document.cookie) {  // Check if cookies exist
    let cookie = document.cookie.split("=");  
    if (cookie.length > 1) { // Ensure there's a value after '='
        let cleanedStr = cookie[1].replace(/%22/g, "");
        userid=cleanedStr;
        console.log("Raw Cookie Value:", cookie[1]);
        console.log("Cleaned Cookie Value:", cleanedStr);
    } else {
        console.log("Cookie is present but has no value.");
    }
} else {
    console.log("No cookies found.");
}



const enroll = async (method)=>{
    const res = await fetch("http://localhost:5000/enroll", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userid:JSON.parse(localStorage.getItem("userLog")).id, method,email :JSON.parse(localStorage.getItem("userLog")).profile.email }),
    })
    const data = await res.json();
    console.log(data);
    getUser()
}

const unenroll = async (method)=>{
    const res = await fetch("http://localhost:5000/unenroll", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userid:JSON.parse(localStorage.getItem("userLog")).id, method }),
    })
    const data = await res.json();
    console.log(data);
    getUser()
}

const getUser = async () => {
    const res = await fetch(`http://localhost:5000/getUser`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userid }),
    });

    const data = await res.json();
    localStorage.setItem("userLog", JSON.stringify(data));

    // Setting user details
    logId.innerText = data.profile.login ?? "";
    email.innerText = data.profile.email;
    mobile.innerText = data.profile.mobilePhone ?? "";
    city.innerText = data.profile.city ?? "";
    state.innerText = data.profile.state ?? "";
    country.innerText = data.profile.countryCode ?? "";
    login2.innerText = data.profile.login ?? "";

    options.forEach(opt => {
        if (opt[data.profile.subscribe]) {
            plans = opt[data.profile.subscribe];
        }
    });

    // Dynamically insert enroll/unenroll buttons
    subscribe.innerHTML = data.profile.subscribe
        ? `${data.profile.subscribe} (<span>${plans.map(method => {
            let pl = method === "okta verify" ? "okta"
                : method === "google authenticator" ? "google"
                : "email";

            return `${method} [<span class="${pl}_enroll">enroll</span> | <span class="${pl}_unenroll">unenroll</span>]`;
        }).join(" ")}</span>)`
        : "";

    // Attach event listeners AFTER elements are inserted
    document.querySelector(".okta_enroll")
    .addEventListener("click", () => enroll("okta verify enroll"));

    document.querySelector(".google_enroll")
    .addEventListener("click", () => enroll("google authenticator enroll"));
    
    document.querySelector(".email_enroll").
    addEventListener("click", () => enroll("email enroll"));
    

    document.querySelector(".okta_unenroll")
    .addEventListener("click", () => unenroll("okta verify unenroll"));
    
    document.querySelector(".google_unenroll")
    .addEventListener("click", () => unenroll("google authenticator unenroll"));
    
    document.querySelector(".email_unenroll")
    .addEventListener("click", () => unenroll("email unenroll"));
    
};

getUser();

