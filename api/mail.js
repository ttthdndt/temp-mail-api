export default async function handler(req, res) {

  const base = "https://api.mail.tm";

  try {

    // tạo email
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

    // login lấy token
    const tokenRes = await fetch(base + "/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        address,
        password
      })
    });

    const tokenData = await tokenRes.json();
    const token = tokenData.token;


    // trả về luôn email + token
    res.status(200).json({
      email: address,
      password: password,
      token: token
    });

  }

  catch (e) {

    res.status(500).json({
      error: e.toString()
    });

  }

}
