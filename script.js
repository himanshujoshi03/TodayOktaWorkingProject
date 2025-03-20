async function createOktaUser() {
    const userData = {
        profile: {
            firstName: document.getElementById("firstName").value,
            lastName: document.getElementById("lastName").value,
            email: document.getElementById("email").value,
            login: document.getElementById("email").value,
            subscribe: "Basic",
        },
        credentials: {
            password: document.getElementById("password").value, // Set a default password (or ask user)
        }
    };
    

    try {
        const response = await fetch("http://localhost:5000/signup", { // ✅ Call your backend
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("User created successfully!");
            window.location.href = "index.html"; // ✅ Redirect to login page
        } else {
            alert(`Error: ${result.errorSummary || "Something went wrong"}`);
        }
    } catch (error) {
        console.error("Network/Fetch Error:", error);
        alert("Failed to connect to the server.");
    }
}

const basic = document.querySelector(".basic")
const premium = document.querySelector(".premium")
const premiumplus = document.querySelector(".premiumplus")

console.log(basic, premium, premiumplus)

basic.addEventListener("click",() => selectPlan("Basic"))
premium.addEventListener("click",() => selectPlan("Premium"))
premiumplus.addEventListener("click",() => selectPlan("Premium Plus"))

const selectPlan = async(plan)=>{
    const response = await fetch("http://localhost:5000/selectPlan", { // ✅ Call your backend
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({plan,userid:JSON.parse(localStorage.getItem("userLog")).id})
    });

    const result = await response.json();

    // let url  = result._links.activate.href;

    // const res = await fetch(url, {
    //     method: "POST",
    //     headers: {
    //         "Authorization": `SSWS ${API_TOKEN}`,
    //         "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({ userid:JSON.parse(localStorage.getItem("userLog")).id, plan }),
    // })
    // const data = await res.json();
    // console.log(data);
    // localStorage.setItem("plan",result)
}

// {
//     "id": "emfnwqm38hap7Npvt5d7",
//     "factorType": "email",
//     "provider": "OKTA",
//     "vendorName": "OKTA",
//     "status": "ACTIVE",
//     "profile": {
//         "email": "a@b.com"
//     },
//     "_links": {
//         "self": {
//             "href": "https://dev-93076686.okta.com/api/v1/users/00unwqm38dajzJaBA5d7/factors/emfnwqm38hap7Npvt5d7",
//             "hints": {
//                 "allow": [
//                     "GET",
//                     "DELETE"
//                 ]
//             }
//         },
//         "verify": {
//             "href": "https://dev-93076686.okta.com/api/v1/users/00unwqm38dajzJaBA5d7/factors/emfnwqm38hap7Npvt5d7/verify",
//             "hints": {
//                 "allow": [
//                     "POST"
//                 ]
//             }
//         },
//         "user": {
//             "href": "https://dev-93076686.okta.com/api/v1/users/00unwqm38dajzJaBA5d7",
//             "hints": {
//                 "allow": [
//                     "GET"
//                 ]
//             }
//         }
//     }
// }