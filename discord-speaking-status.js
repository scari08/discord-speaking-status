listenForDiscordEvents = function (e) {
  let user = game.users.find((u) => u.flags["discord-speaking-status"]?.id == e.data.user_id);
  if (!user) return;
  let isGM = user.name == "Gamemaster" ? true : false;

  if (e.data.evt == "SPEAKING_START") {

    if (!isGM && theatre && theatre.dockActive && theatre.getInsertByName(game.user.character.name)) {
      let imgId = theatre.getInsertByName(game.user.character.name).imgId;
      theatre.setUserEmote(game.userId, imgId, "emote", "custom0", undefined);
    }
  }
  if (e.data.evt == "SPEAKING_STOP") {

    if (!isGM && theatre && theatre.dockActive && theatre.getInsertByName(game.user.character.name)) {
      let imgId = theatre.getInsertByName(game.user.character.name).imgId;
      theatre.setUserEmote(game.userId, imgId, "emote", "", undefined);
    }
  }
};

Hooks.on("ready", () => {
  window.addEventListener("message", listenForDiscordEvents, false);
});

const unsecuredCopyToClipboard = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
  } catch (err) {
    console.error("Unable to copy to clipboard", err);
  }
  document.body.removeChild(textArea);
};

openDiscordWindow = async function () {
  let code =
    'const users = {};\r\nconst log = window.console.log.bind(window.console);\r\nwindow.console.log = (...args) => {\r\n  if (!args[1] || !window.opener)return log(...args);\r\n  if (typeof args[1] !== \'object\') return log(...args);\r\n  let data = args[1].data;\r\n\tdata.evt = args[1].evt;\r\n\tif (data.evt == "VOICE_STATE_UPDATE") {\r\n\t\tusers[data.user.id] = `${data.user.username}#${data.user.discriminator}`\r\n\t\treturn console.log(users[data.user.id], \'added to users\', users)\r\n\t}\r\n\tif (!["SPEAKING_START", "SPEAKING_STOP"].includes(data.evt)) return log(...args);\r\n\tdata.name = users[data.user_id];\r\n\tdata.nick = document.querySelector(`img[src*="${data.user_id}"]`)?.parentElement?.querySelector("span").innerHTML;\r\n\tlog(\'sending this data to window.opener\', data);\r\n  window.opener.postMessage(data, \'*\');\r\n}';
  if (window.isSecureContext) {
    await window.navigator.clipboard.writeText(code);
  } else {
    unsecuredCopyToClipboard(code);
  }
  channel = game.settings.get("discord-speaking-status", "channel");
  let parts = channel.split("/");
  window.open(`https://streamkit.discord.com/overlay/voice/${parts[4]}/${parts[5]}`);
};

Hooks.once("init", async () => {
  game.settings.register("discord-speaking-status", "channel", {
    name: `Discord Voice Channel URL`,
    hint: `Right click the channel in discord and click "Copy Link"`,
    scope: "world",
    config: true,
    type: String,
    default: "",
    requiresReload: false,
  });
});

Hooks.on("renderSettings", (app, html) => {
  html.find("#settings-access").prepend(
    $(`<button><i class="fa-brands fa-discord"></i> Open Discord StreamKit</button>`).click(function () {
      openDiscordWindow();
    })
  );
});

Hooks.on("renderUserConfig", (app, html, data) => {
  html.append(`<style>#${html.closest(".app").attr("id")} { height: auto !important;} </style>`);
  html.find("form").prepend(
    $(`
        <div class="form-group">
          <label>Discord User ID</label>
          <input type="text" name="flags.discord-speaking-status.id">
        </div>
  `)
  );
  html.find('input[name="flags.discord-speaking-status.id"]').val(data.user.flags["discord-speaking-status"]?.id);
});
