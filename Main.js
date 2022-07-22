// Import for local javascript development --> Comment on Google Apps Script
// import "google-apps-script";

// Widgets: https://developers.google.com/apps-script/reference/card-service/text-input

function onHomepage(event) {
  console.log(event);

  return CardService.newCardBuilder()
    .addSection(buildStep1())
    .addSection(buildStep2())
    .addSection(buildStep3())
    .build();
}

function getUserdata() {
  const email = Session.getActiveUser().getEmail();
  return AdminDirectory.Users.get(email, {
    "projection": "full",
  });
}

function getCurrentChipnumber() {
  const userdata = getUserdata();
  if (!userdata.hasOwnProperty("customSchemas")) {
    return "";
  }

  const customSchemas = userdata["customSchemas"];
  if (!customSchemas.hasOwnProperty("fuks")) {
    return "";
  }

  const fuks = customSchemas["fuks"];
  if (fuks.hasOwnProperty("KIT_Card_Chipnummer")) {
    return fuks["KIT_Card_Chipnummer"];
  }

  return "";
}

function buildStep1() {
  var text = CardService.newTextParagraph()
    .setText("The fuks office door can be opened by your KIT-Card. "
      + "You must be a member of the \"aktive@fuks.org\" workspace group to gain access. "
      + "Follow the next steps to add your KIT-Card chip number to the system.");

  return CardService.newCardSection()
    .setHeader("Step 1: Read this")
    .addWidget(text);
}

function buildStep2() {
  var goto = CardService.newDecoratedText()
    .setText("Go to https://my.scc.kit.edu > Anmelden > Konto/KIT-Account > KIT-Card")
    .setWrapText(true)
    .setOpenLink(CardService.newOpenLink()
      .setUrl("https://my.scc.kit.edu/shib/accountinformationen.php")
      .setOpenAs(CardService.OpenAs.OVERLAY)
      .setOnClose(CardService.OnClose.NOTHING));

  return CardService.newCardSection()
    .setHeader("Step 2: Find your chipnumber")
    .addWidget(goto);
}

function buildStep3() {
  var input = CardService.newTextInput()
    .setFieldName("KIT_Card_Chipnummer")
    .setTitle("KIT-Card Chipnummer")
    .setValue(getCurrentChipnumber())
    .setMultiline(false);

  var save = CardService.newTextButton()
    .setText('Save')
    .setOnClickAction(CardService.newAction()
      .setFunctionName('onSave'))
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED);

  return CardService.newCardSection()
    .setHeader("Step 3: Save your chipnumber")
    .addWidget(input)
    .addWidget(save);
}

function onSave(event) {

  const input = event.formInput["KIT_Card_Chipnummer"];
  const chipnumber = parseInt(input);
  const ok = chipnumber > 0;

  if (ok) {
    const userdata = getUserdata();

    if (!userdata.hasOwnProperty("customSchemas")) {
      userdata.customSchemas = {};
    }

    userdata.customSchemas["fuks"] = {
      "KIT_Card_Chipnummer": input
    };

    AdminDirectory.Users.update(userdata, email);

    console.log({
      "input": event.formInput,
      "email": email,
      "customSchemas": userdata.customSchemas,
      "parsed": chipnumber,
    });
  }

  var status = CardService.newDecoratedText()
    .setTopLabel(ok
      ? "Success"
      : "Error")
    .setText(ok
      ? "Saved '" + input + "' as chipnumber"
      : "The input '" + input + "' not a valid chipnumber")
    .setEndIcon(CardService.newIconImage().setIconUrl(ok
      ? "https://www.gstatic.com/images/icons/material/system/1x/check_black_48dp.png"
      : "https://www.gstatic.com/images/icons/material/system/1x/error_black_48dp.png"))
    .setWrapText(true);

  return CardService.newCardBuilder()
    .addSection(CardService.newCardSection().addWidget(status))
    .build();
}
