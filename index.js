const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const session = require("express-session");
const axios = require("axios");
const querystring = require("querystring");
const { profile } = require("console");

const app = express();//initialize express app
app.use(cors());//middleware to allow cross-origin requests
app.use(express.json());//middleware to parse json data



const OKTA_DOMAIN = "https://dev-93076686.okta.com";
const API_TOKEN = "00CwZ9HwAqbM2r2stUe9pOStTJBuWM3q_jOxeYVroA";
const CLIENT_ID = "0oanvofz0rMrDxQQV5d7";
const CLIENT_SECRET = "ryT4EvtUtb0ohyN1f-Cdiff-JuCn1rM_rs0GqRUHzVbz0_VHfyEjBWMA8TDWJBMR";
const REDIRECT_URI = "http://127.0.0.1:5000/authorization-code/callback";


app.get("/auth/okta", (req, res) => {
    const authUrl = `${OKTA_DOMAIN}`;
    res.redirect(authUrl);
});
// Step 2: Handle Okta callback after authentication
app.get("/authorization-code/callback", async (req, res) => {
    const { code } = req.query;
    console.log("called");
    if (!code) {
        return res.status(400).json({ error: "Authorization code not provided" });
    }

    try {
        // Exchange authorization code for access token
        const tokenResponse = await axios.post(
            `${OKTA_DOMAIN}/oauth2/default/v1/token`,
            {
                grant_type: "authorization_code",
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                code: code
            }, 
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        const accessToken = tokenResponse.data.access_token;
        // console.log(tokenResponse.data);


        // Fetch user info from Okta
        const userInfoResponse = await axios.get(`${OKTA_DOMAIN}/oauth2/default/v1/userinfo`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const user = userInfoResponse.data;
        // localStorage.setItem("user", JSON.stringify(user.sub));
        res.cookie("user", JSON.stringify(user.sub));
        // console.log(user);
        // console.log(user);

        // Redirect to homepage with user data
        res.redirect(`http://127.0.0.1:5500/homepage.html`);

    } catch (error) {
        console.error("Error during authentication:", error);
        res.status(500).json({ error: "Failed to authenticate" });
    }
});

app.post("/signup", async (req, res) => {
    try {
        const response = await fetch(`${OKTA_DOMAIN}/api/v1/users?activate=true`, {
            method: "POST",
            headers: {
                "Authorization": `SSWS ${API_TOKEN}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();//convert response to json
        res.status(response.status).json(data);//to frontend
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.post("/getUser", async (req, res) => {
    // console.log(req.body);
    const userId = req.body.userid
    // res.send("Hello world")
    try {
        const response = await fetch(`${OKTA_DOMAIN}/api/v1/users/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `SSWS ${API_TOKEN}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
        });

        const data = await response.json();//convert response to json
        res.status(response.status).json(data);//to frontend
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/update-profile', async (req, res) => {
    const { userData, userid } = req.body;
    const { firstName, lastName, username, email, mobile, city, state, country } = userData;
    // console.log(userid);
    try {
        // Fetch user from Okta by email
        // const userSearchResponse = await fetch(`${OKTA_DOMAIN}/api/v1/users/${userid}`, {
        //     headers: {
        //         'Authorization': `SSWS ${API_TOKEN}`,
        //         'Accept': 'application/json'
        //     }
        // });

        // const users = await userSearchResponse.json();
        // console.log(users);
        // if (!users.length) {
        //     return res.status(404).json({ message: 'User not found in Okta' });
        // }
        // const userId = users[0].id;

        // Update user profile in Okta
        const updateResponse = await fetch(`${OKTA_DOMAIN}/api/v1/users/${userid}`, {
            method: 'POST',
            headers: {
                'Authorization': `SSWS ${API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                profile: {
                    login: email,
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    mobilePhone: mobile,
                    city: city,
                    state: state,
                    countryCode: country,
                }
            })
        });
        if (!updateResponse.ok) {
            return res.status(updateResponse.status).json({ message: 'Failed to update user in Okta' });
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.post('/selectPlan', async (req, res) => {
    const { plan, userid } = req.body;
   
    try {
        // Update user profile in Okta
        const updateResponse = await fetch(`${OKTA_DOMAIN}/api/v1/users/${userid}`, {
            method: 'POST',
            headers: {
                'Authorization': `SSWS ${API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                profile: {
                    subscribe: plan
                }
            })
        });
        // console.log(updateResponse);
        if (!updateResponse.ok) {
            return res.status(updateResponse.status).json({ message: 'Failed to update user in Okta' });
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/enroll', async (req, res) => {
    const { method, userid,email } = req.body;
    // console.log(userid, method);
    let body={}
    if (method === "okta verify enroll") {
        body={
            factorType : "token::software:totp",
            provider : "OKTA"
        }
        
    }
    else if (method === "google authenticator enroll") {
        body={
            factorType :"token:software:totp",
            provider : "GOOGLE",
        }
    }
    else if (method === "email enroll") {
        body={
            factorType : "email",
            provider : "OKTA",
            profile : {
                email ,
            }

        }
    }
    
    try {

        // Update user profile in Okta
        const updateResponse = await fetch(`${OKTA_DOMAIN}/api/v1/users/${userid}/factors`, {
            method: 'POST',
            headers: {
                'Authorization': `SSWS ${API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const data = await updateResponse.json();
        console.log(data);
        if (!updateResponse.ok) {
            return res.status(updateResponse.status).json({ message: 'Failed to update factor in Okta' ,});
        }

        // res.json({ message: 'enroll successfully' ,factorId : data.id});
        res.json(data)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/unenroll', async (req, res) => {
    const { method, userid,email } = req.body;
    // console.log(userid, method);
    let body={}
    if (method === "okta verify enroll") {
        body={
            factorType : "token::software:totp",
            provider : "OKTA"
        }
        
    }
    else if (method === "google authenticator enroll") {
        body={
            factorType :"token:software:totp",
            provider : "GOOGLE",
        }
    }
    else if (method === "email enroll") {
        body={
            factorType : "email",
            provider : "OKTA",
            profile : {
                email ,
            }

        }
    }
    
    try {

        // Update user profile in Okta
        const updateResponse = await fetch(`${OKTA_DOMAIN}/api/v1/users/${userid}/factors/${factorId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `SSWS ${API_TOKEN}`,
                'Content-Type': 'application/json'
            },
        });
        const data = await updateResponse.json();
        // console.log(data);
        if (!updateResponse.ok) {
            return res.status(updateResponse.status).json({ message: 'Failed to update user in Okta' });
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));