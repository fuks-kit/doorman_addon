// Widgets: https://developers.google.com/apps-script/reference/card-service/text-input

function onHomepage(event) {
  console.log(event);
  return buildCard(true);
}

function onDriveItemsSelected(e) {
  console.log(e);
  return buildCard(false);
}

function buildCard(isHomepage) {
  if (!isHomepage) {
    isHomepage = false;
  }

  var action = CardService.newAuthorizationAction()
    .setAuthorizationUrl('https://my.scc.kit.edu/shib/accountinformationen.php');

  var gotoscc = CardService.newDecoratedText()
    .setText("Go to https://my.scc.kit.edu > Anmelden > Konto/KIT-Account > KIT-Card")
    // .setIconUrl("https://www.gstatic.com/images/icons/material/system/1x/launch_black_48dp.png")
    //.setEndIcon(CardService.newIconImage().setIconUrl("https://www.gstatic.com/images/icons/material/system/1x/launch_black_48dp.png"))
    .setWrapText(true)
    .setAuthorizationAction(action);

  var infoText = CardService.newTextParagraph()
    .setText("The fuks office door can be opened by your KIT-Card. "
      + "To gain access you need to be a member in the \"aktive\" Workspace group. "
      + "You also need add your KIT-Card chipnumber to the the input field below.");

  var infoStep = CardService.newCardSection()
    .setHeader("Step 1: Read this")
    .addWidget(infoText);

  var step2 = CardService.newCardSection()
    .setHeader("Step 2: Find your chipnumber")
    .addWidget(gotoscc);

  var email = Session.getActiveUser().getEmail();
  var userdata = AdminDirectory.Users.get(email, {
    "projection": "full",
  });

  var chipnumber = CardService.newTextInput()
    .setFieldName("KIT_Card_Chipnummer")
    .setTitle("KIT-Card Chipnummer")
    .setValue(userdata["customSchemas"]["fuks"]["KIT_Card_Chipnummer"])
    .setMultiline(false);

  var saveAction = CardService.newAction()
    .setFunctionName('onChange');

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

  if (!isHomepage) {
    // Create the header shown when the card is minimized,
    // but only when this card is a contextual card. Peek headers
    // are never used by non-contexual cards like homepages.
    var peekHeader = CardService.newCardHeader()
      .setTitle('Contextual Cat')
      .setImageUrl('https://www.gstatic.com/images/icons/material/system/1x/key_black_48dp.png')
      .setSubtitle("subtitle");
    card.setPeekCardHeader(peekHeader)
  }

  return card.build();
}

function onChange(event) {

  var email = Session.getActiveUser().getEmail();
  var userdata = AdminDirectory.Users.get(email, {
    "projection": "full",
  });

  const input = event.formInput["KIT_Card_Chipnummer"];
  const chipnumber = parseInt(input);
  const ok = chipnumber > 0;

  if (ok) {
    userdata.customSchemas["fuks"]["KIT_Card_Chipnummer"] = chipnumber;
    AdminDirectory.Users.update(userdata, email);
  }

  /*
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('Status'))
    .addSection(CardService.newCardSection().addWidget(
      CardService.newKeyValue().setContent(JSON.stringify({
        "input": event.formInput,
        "email": email,
        "customSchemas": userdata.customSchemas,
        "parse": chipnumber,
      }, null, "  ")))
    )
    .build();
  */

  var status = CardService.newDecoratedText()
    .setTopLabel(ok
      ? "Success"
      : "Error")
    .setText(ok
      ? "Saved '" + chipnumber + "' as chipnumber"
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

