require('babel-runtime/core-js/promise').default = require('bluebird');

import {NamedKernelManager, NamedKernelManagerControllers} from 'named-kernel-manager';
import 'named-kernel-manager-default-plugins';
import {GhostKernelControllers} from 'ghost-kernel';
import 'ghost-kernel-default-plugins';
import cuttlebone from 'cuttlebone';
import NanikaStorage from 'nanika-storage';
import {TimerEventSource} from 'ukagaka-timer-event-source';

function promisify(fs) {
  fs.mkdirPromise = (dir) => new Promise((resolve, reject) => fs.mkdir(dir, (error) => error ? reject(error) : resolve()));
  fs.statPromise = (item) => new Promise((resolve, reject) => fs.stat(item, (error, stats) => error ? reject(error) : resolve(stats)));
  fs.readFilePromise = (item) => new Promise((resolve, reject) => fs.readFile(item, {encoding: 'utf8'}, (error, data) => error ? reject(error) : resolve(data)));
  fs.writeFilePromise = (item, data) => new Promise((resolve, reject) => fs.writeFile(item, data, (error) => error ? reject(error) : resolve()));
}

const ikagakaDir = '/ikagaka';
const initialGhostUrl = './js.nar';
const initialBalloonUrl = './origin.nar';
const jsVersion = 'period1';
const jsVersionFile = '/js_version';

export class IkagakaApplication {
  static async start() {
    // TODO: error
    const idbfs = await new Promise((resolve, reject) => new BrowserFS.FileSystem.IndexedDB((error, idbfs) => error ? reject(error) : resolve(idbfs)));
    BrowserFS.initialize(idbfs);
    const fs = BrowserFS.BFSRequire('fs');
    const path = BrowserFS.BFSRequire('path');
    const buffer = BrowserFS.BFSRequire('buffer');
    promisify(fs);
    try {
      await fs.mkdirPromise(ikagakaDir);
    } catch (error) { } // errorをスルー

    const nanikaStorage = new NanikaStorage(new NanikaStorage.Backend.FS(ikagakaDir, fs, path, buffer.Buffer));
    const namedManager = new cuttlebone.NamedManager();
    const timerEventSource = new TimerEventSource();
    const namedKernelManager = new NamedKernelManager({
      NamedManager: namedManager,
      NanikaStorage: nanikaStorage,
      TimerEventSource: timerEventSource,
    });
    namedKernelManager.GhostViewClass = cuttlebone;
    const ikagakaApplication = new IkagakaApplication(namedKernelManager);
    IkagakaApplication.current = ikagakaApplication;

    let baseProfileStat;
    try {
      baseProfileStat = await fs.statPromise(path.dirname(nanikaStorage.base_profile_path()));
    } catch (error) { } // errorをスルー
    if (baseProfileStat && baseProfileStat.isFile()) {
      // TODO
      window.alert("互換性の無い変更が加わりました。\n動作のために古いファイルを削除します。");
      IkagakaApplication.current.deleteStorage();
    }
    // profile
    const baseProfile = await nanikaStorage.base_profile();
    if (!baseProfile.ghosts) {
      baseProfile.ghosts = ['ikaga'];
      baseProfile.balloonname = 'origin';
      await nanikaStorage.base_profile(baseProfile);
    }
    // デフォゴインストール
    let currentJsVersion;
    try {
      currentJsVersion = await fs.readFilePromise(jsVersionFile);
    } catch (error) { }
    if (jsVersion !== currentJsVersion) {
      console.log(namedKernelManager.installNar);
      await namedKernelManager.installNar(initialGhostUrl);
      console.log("install default 4");
      await namedKernelManager.installNar(initialBalloonUrl);
      console.log("install default 5");
      await fs.writeFilePromise(jsVersionFile, jsVersion);
    }

    $('#ikagaka_boot').click(() => IkagakaApplication.current.boot());
    $('#ikagaka_close').click(() => IkagakaApplication.current.close());
    $('#ikagaka_delete').click(() => IkagakaApplication.current.deleteStorage());
    $(namedManager.element).appendTo("body");
      console.log("install default 6");
    IkagakaApplication.current.boot();
  }

  constructor(namedKernelManager) {
    this.namedKernelManager = namedKernelManager;
  }

  boot() {
    this.namedKernelManager.start();
    $('#ikagaka_boot').attr('disabled', true);
    $('#ikagaka_close').removeAttr('disabled');
  }

  close() {
    this.namedKernelManager.close();
  }

  async deleteStorage() {
    const nanikaStorage = this.namedKernelManager.components.NanikaStorage;
    if (window.confirm('本当に削除しますか？')) {
      await nanikaStorage.backend._rmAll(ikagakaDir);
      await nanikaStorage.backend._unlink(jsVersionFile);
      window.onbeforeunload = () => 1;
      location.reload();
    }
  }

  menu() {
  }
}

IkagakaApplication.start();

/*
$ ->
	if require?
		gui = require('nw.gui')
		win = gui.Window.get()
		win.resizeTo(screen.availWidth, screen.availHeight)
		win.moveTo(0, 0)
	con = new Console("body")
	log = console.log
	warn = console.warn
	error = console.error
	console.log = (args...) =>
		log.apply console, args
		t = args.join('')
		unless /SHIORI\/\d\.\d|^\[object Object\]$/.test t
			con.log t
	console.warn = (args...) =>
		warn.apply console, args
		con.warn args.join ''
	console.error = (args...) =>
		error.apply console, args
		con.error args.join ''

	fs_root = 'ikagaka'
	balloon_nar = './vendor/nar/origin.nar'
	ghost_nar = './vendor/nar/ikaga.nar'
	ghost_nar2 = './vendor/nar/touhoku-zunko_or__.nar'

	nanikamanager = null
	boot_nanikamanager = ->
		# メニュー項目取得
		if nanikamanager then return
		nanikamanager = new NanikaManager(storage, namedmanager, append_path: './vendor/js/', logging: true)
		$('#ikagaka_boot').attr('disabled', true)
		$('#ikagaka_halt').removeAttr('disabled')
		contextmenu = initialize: (nanika) ->
			update_ghostnames(nanika)
			update_shellnames(nanika)
			update_balloonnames(nanika)
			nanika.on 'named.initialized', ->
				console.log "named.initialized", nanika
				return unless nanika.namedid?
				named = namedmanager.named(nanika.namedid)
				named.contextmenu (ev)->
					{scopeId} = ev
					items:
						changeGhost:
							name: "ゴースト切り替え"
							items: ghostnames.reduce(((o, [name, dst_dirpath])->
								o["changeGhost>"+dst_dirpath] = if nanikamanager.is_existing_ghost(dst_dirpath) && nanika.ghostpath != dst_dirpath
								then name: name+"に変更", disabled: true
								else name: name+"に変更", callback: ->
									console.log("change Ghost>", name, dst_dirpath)
									nanikamanager.change(nanika.ghostpath, dst_dirpath)
								return o
							), {})
						callGhost:
							name: "他のゴーストを呼ぶ"
							items: ghostnames.reduce(((o, [name, dst_dirpath])->
								o["callGhost>"+dst_dirpath] = if nanikamanager.is_existing_ghost(dst_dirpath)
								then name: name+"を呼ぶ", disabled: true
								else name: name+"を呼ぶ", callback: ->
									console.log("call Ghost>", name, dst_dirpath)
									nanikamanager.call(nanika.ghostpath, dst_dirpath)
								return o
							), {})
						changeShell:
							name: "シェル"
							items: shellnames.reduce(((o, [name, dst_dirpath])->
								o["changeShell>"+dst_dirpath] = if named.shell.descript.name == name
								then name: name+"に変更", disabled: true
								else name: name+"に変更", callback: ->
									console.log("change Shell>", name, dst_dirpath)
									scope_surfaces = {}
									Object.keys(named.scopes).forEach (scopeId)->
										scope_surfaces[scopeId] = named.scopes[scopeId].currentSurface.surfaceId
									nanika.change_named(dst_dirpath, nanika.profile.balloonpath).then ->
										Object.keys(scope_surfaces).forEach (scopeId)->
											named.scope(scopeId).surface(scope_surfaces[scopeId])
								return o
							), {})
						changeBalloon:
							name: "バルーン"
							items: balloonnames.reduce(((o, [name, dst_dirpath])->
								o["changeBalloon>"+dst_dirpath] = if named.balloon.descript.name == name
								then name: name+"に変更", disabled: true
								else name: name+"に変更", callback: ->
									console.log("change Balloon>", name, dst_dirpath)
									scope_surfaces = {}
									Object.keys(named.scopes).forEach (scopeId)->
										scope_surfaces[scopeId] = named.scopes[scopeId].currentSurface.surfaceId
									nanika.change_named(nanika.profile.shellpath, dst_dirpath).then ->
										Object.keys(scope_surfaces).forEach (scopeId)->
											named.scope(scopeId).surface(scope_surfaces[scopeId])
								return o
							), {})
						install: name: "インストール", callback: ->
							$('#install_field').remove()
							install_field = $('<input type="file" />').attr('id', 'install_field').css(display: 'none')
							.change (ev) =>
								for file in ev.target.files
									install_nar file, nanika.ghostpath, nanika.ghost.descript['sakura.name']
									.then ->
										update_ghostnames(nanika)
										update_shellnames(nanika)
										update_balloonnames(nanika)
								$('#install_field').remove()
							$('body').append install_field
							install_field.click()
						inputScript: name: '開発用 スクリプト入力', callback: -> nanika.ssp.play window.prompt('send')
						clearAll:    name: '全消去', callback: -> delete_storage()
						quit:        name: '終了', callback: -> nanikamanager.close(nanika.ghostpath, 'user')
						quitAll:     name: '全て終了', callback: -> nanikamanager.closeall('user')
		install = initialize: (nanika) ->
			nanika.on 'named.initialized', ->
				unless nanika.namedid?
					return
				named = namedmanager.named(nanika.namedid)
				named.on 'filedrop', (ev) =>
					ev.event.stopPropagation()
					ev.event.preventDefault()
					ev.event.originalEvent.dataTransfer.dropEffect = 'copy'
					for file in ev.event.originalEvent.dataTransfer.files
						install_nar file, nanika.ghostpath, nanika.ghost.descript['sakura.name']
						.then ->
							update_ghostnames(nanika)
							update_shellnames(nanika)
							update_balloonnames(nanika)

		notice_events = initialize: (nanika) ->
			name = nanika.ghost.descript.name
			nanika.on 'named.initialized', -> console.log 'materialized '+name
			nanika.on 'halted', -> console.log 'halted '+name
		NanikaPlugin.contextmenu = contextmenu
		NanikaPlugin.install = install
		NanikaPlugin.notice_events = notice_events
		nanikamanager.on 'destroyed', ->
			nanikamanager = null
			$('#ikagaka_boot').removeAttr('disabled')
			$('#ikagaka_halt').attr('disabled', true)
			window.onbeforeunload = ->
			if require?
				window.close()
		console.log 'baseware booting'
		window.onbeforeunload = (event) -> event.returnValue = 'ベースウェアを終了していません。\n状態が保存されませんが本当にページを閉じますか？'
		nanikamanager.initialize()
		.then ->
			nanikamanager.bootall()

#	mfs = new BrowserFS.FileSystem.InMemory()
#	cb(null, mfs)
# メニュー表示用の項目リスト
	ghostnames = []
	update_ghostnames = (nanika)->
		storage.ghosts().then (ghosts) ->
			Promise.all ghosts.map (dst_dirpath) -> storage.ghost_name(dst_dirpath).then (name) -> [name, dst_dirpath]
			.then (_ghostnames)-> ghostnames = _ghostnames
	shellnames = []
	update_shellnames = (nanika)->
		storage.shells(nanika.ghostpath).then (shells) ->
			Promise.all shells.map (dst_dirpath) -> storage.shell_name(nanika.ghostpath, dst_dirpath).then (name) -> [name, dst_dirpath]
			.then (_shellnames)-> shellnames = _shellnames
	balloonnames = []
	update_balloonnames = (nanika)->
		storage.balloons().then (balloons) ->
			Promise.all balloons.map (dst_dirpath) -> storage.balloon_name(dst_dirpath).then (name) -> [name, dst_dirpath]
			.then (_balloonnames)-> balloonnames = _balloonnames
      */
