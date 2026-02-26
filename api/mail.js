const base = "https://api.mail.tm";


async function createMail() {

  const domainRes = await fetch(base + "/domains");

  const domainData = await domainRes.json();

  const domain = domainData["hydra:member"][0].domain;


  const username = Math.random().toString(36).substring(2, 12);

  const address = username + "@" + domain;

  const password = "123456";


  await fetch(base + "/accounts", {

    method: "POST",

    headers: {

      "Content-Type": "application/json"

    },

    body: JSON.stringify({

      address,

      password

    })

  });


  return { address, password };

}



async function getToken(email, password) {

  const res = await fetch(base + "/token", {

    method: "POST",

    headers: {

      "Content-Type": "application/json"

    },

    body: JSON.stringify({

      address: email,

      password: password

    })

  });


  const data = await res.json();

  return data.token;

}



async function getCode(token) {

  const msgRes = await fetch(base + "/messages", {

    headers: {

      Authorization: "Bearer " + token

    }

  });


  const msgData = await msgRes.json();


  if (msgData["hydra:member"].length === 0)

    return null;



  const id = msgData["hydra:member"][0].id;



  const mailRes = await fetch(base + "/messages/" + id, {

    headers: {

      Authorization: "Bearer " + token

    }

  });



  const mail = await mailRes.json();



  const match = mail.text.match(/\b[A-Z0-9]{3}-[A-Z0-9]{3}\b/);



  if (match)

    return match[0];



  return null;

}



async function waitForCode() {

  const acc = await createMail();

  const token = await getToken(acc.address, acc.password);


  for (let i = 0; i < 60; i++) {

    const code = await getCode(token);

    if (code)

      return {

        email: acc.address,

        password: acc.password,

        code

      };


    await new Promise(r => setTimeout(r, 2000));

  }


  return {

    error: "Timeout"

  };

}



export default async function handler(req, res) {

  const result = await waitForCode();

  res.status(200).json(result);

}
