listenForDiscordEvents = function (e) {
  let user = game.users.getName(e.data.name);
  if (!user) return;
  
  let tokens = user.character?.getActiveTokens();
  if (e.data.evt=="SPEAKING_START") {
    tokens.forEach(t => {
      $(`#player-list > li[data-user-id="${user.id}"] span:first-child`).css({outline: '5px solid #3BA53B'});
      $('#hud').append($(`<div class="token-marker ${t.id}" style="position: absolute; top: ${t.y}px; left: ${t.x}px; width: ${t.w}px; height: ${t.h}px; outline: 5px solid #3BA53B; border-radius: 5px;"></div>`));
    });
  }
  if (e.data.evt=="SPEAKING_STOP") {
    $(`#player-list > li[data-user-id="${user.id}"] span:first-child`).css({outline: 'unset'});;
    tokens.forEach(t => { $('#hud').find(`div.token-marker.${t.id}`).remove(); });
  }
}
Hooks.on('ready', window.addEventListener("message", listenForDiscordEvents, false))


Hooks.on('refreshToken', (t)=>{
	if (t.isPreview) return;
  $(`#hud > div.token-marker.${t.id}`).css({ top: `${t.y}px`, left: `${t.x}px`});
});

openDiscordWindow = function () {
  channel = game.settings.get("discord-speaking-status", "channel");
  let parts = channel.split('/');
  return window.open(`https://streamkit.discord.com/overlay/voice/${parts[4]}/${parts[5]}`)
}
Hooks.once("init", async () => {
  
  game.settings.register('discord-speaking-status', 'channel', {
    name: `Discord Voice Channel URL`,
    hint: `Right click the channel in discord and click "Copy Link"`,
    scope: "world",
    config: true,
    type: String,
    default: "",
    requiresReload: false
  });

});