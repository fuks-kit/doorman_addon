// Import for local javascript development --> Comment on Google Apps Script
// import "google-apps-script";

// Widgets: https://developers.google.com/apps-script/reference/card-service/text-input

function onHomepage(event) {
  console.log(event);
  return buildCard();
}

function getCurrentChipnumber() {
  const email = Session.getActiveUser().getEmail();
  const userdata = AdminDirectory.Users.get(email, {
    "projection": "full",
  });

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

function buildCard() {
  var action = CardService.newAuthorizationAction()
    .setAuthorizationUrl('https://my.scc.kit.edu/shib/accountinformationen.php');

  var gotoscc = CardService.newDecoratedText()
    .setText("Go to https://my.scc.kit.edu > Anmelden > Konto/KIT-Account > KIT-Card")
    //.setIconUrl("https://www.gstatic.com/images/icons/material/system/1x/launch_black_48dp.png")
    //.setEndIcon(CardService.newIconImage().setIconUrl("https://www.gstatic.com/images/icons/material/system/1x/launch_black_48dp.png"))
    .setWrapText(true)
    .setAuthorizationAction(action);

  var infoText = CardService.newTextParagraph()
    .setText("The fuks office door can be opened by your KIT-Card. "
      + "You must be a member of the \"aktive@fuks.org\" workspace group to gain access. "
      + "Follow the next steps to add your KIT-Card chip number to the system.");

  var infoStep = CardService.newCardSection()
    .setHeader("Step 1: Read this")
    .addWidget(infoText);

  var step2 = CardService.newCardSection()
    .setHeader("Step 2: Find your chipnumber")
    .addWidget(gotoscc);

  var chipnumber = CardService.newTextInput()
    .setFieldName("KIT_Card_Chipnummer")
    .setTitle("KIT-Card Chipnummer")
    .setValue(getCurrentChipnumber())
    .setMultiline(false);

  var saveAction = CardService.newAction()
    .setFunctionName('onSave');

  var button = CardService.newTextButton()
    .setText('Save')
    .setOnClickAction(saveAction)
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED);

  var step3 = CardService.newCardSection()
    .setHeader("Step 3: Save your chipnumber")
    .addWidget(chipnumber)
    .addWidget(button);

  var card = CardService.newCardBuilder()
    .addSection(infoStep)
    .addSection(step2)
    .addSection(step3);

  return card.build();
}

function onSave(event) {

  var email = Session.getActiveUser().getEmail();
  var userdata = AdminDirectory.Users.get(email, {
    "projection": "full",
  });

  const input = event.formInput["KIT_Card_Chipnummer"];
  const chipnumber = parseInt(input);
  const ok = chipnumber > 0;

  if (ok) {
    if (!userdata.hasOwnProperty("customSchemas")) {
      userdata.customSchemas = {};
    }

    userdata.customSchemas["fuks"] = {
      "KIT_Card_Chipnummer": input
    };
    AdminDirectory.Users.update(userdata, email);
  }

  console.log({
    "input": event.formInput,
    "email": email,
    "customSchemas": userdata.customSchemas,
    "parsed": chipnumber,
  });

  var status = CardService.newDecoratedText()
    .setTopLabel(ok
      ? "Success"
      : "Error")
    .setText(ok
      ? "Saved '" + input + "' as chipnumber"
      : "The input '" + input + "' is not a valid chipnumber")
    .setIconUrl(ok
      ? "https://www.gstatic.com/images/icons/material/system/1x/check_circle_black_48dp.png"
      : "https://www.gstatic.com/images/icons/material/system/1x/error_black_48dp.png")
    //.setEndIcon(CardService.newIconImage().setIconUrl(ok
    //  ? "https://www.gstatic.com/images/icons/material/system/1x/check_circle_black_48dp.png"
    //  : "https://www.gstatic.com/images/icons/material/system/1x/error_black_48dp.png"))
    .setWrapText(true);

  return CardService.newCardBuilder().addSection(
    CardService.newCardSection().addWidget(status)
  ).build();
}

