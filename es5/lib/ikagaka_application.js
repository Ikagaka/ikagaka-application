'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.IkagakaApplication = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _namedKernelManager = require('named-kernel-manager');

require('named-kernel-manager-default-plugins');

var _ghostKernel = require('ghost-kernel');

require('ghost-kernel-default-plugins');

var _cuttlebone = require('cuttlebone');

var _cuttlebone2 = _interopRequireDefault(_cuttlebone);

var _nanikaStorage = require('nanika-storage');

var _nanikaStorage2 = _interopRequireDefault(_nanikaStorage);

var _ukagakaTimerEventSource = require('ukagaka-timer-event-source');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('babel-runtime/core-js/promise').default = require('bluebird');

console.log(_namedKernelManager.NamedKernelManagerControllers);

console.log(_ghostKernel.GhostKernelControllers);


function promisify(fs) {
	fs.mkdirPromise = function (dir) {
		return new _promise2.default(function (resolve, reject) {
			return fs.mkdir(dir, function (error) {
				return error ? reject(error) : resolve();
			});
		});
	};
	fs.statPromise = function (item) {
		return new _promise2.default(function (resolve, reject) {
			return fs.stat(item, function (error, stats) {
				return error ? reject(error) : resolve(stats);
			});
		});
	};
	fs.readFilePromise = function (item) {
		return new _promise2.default(function (resolve, reject) {
			return fs.readFile(item, { encoding: 'utf8' }, function (error, data) {
				return error ? reject(error) : resolve(data);
			});
		});
	};
	fs.writeFilePromise = function (item, data) {
		return new _promise2.default(function (resolve, reject) {
			return fs.writeFile(item, data, function (error) {
				return error ? reject(error) : resolve();
			});
		});
	};
}

var ikagakaDir = '/ikagaka';
var initialGhostUrl = './js.nar';
var initialBalloonUrl = './origin.nar';
var jsVersion = 'period1';
var jsVersionFile = '/js_version';

var IkagakaApplication = exports.IkagakaApplication = function () {
	(0, _createClass3.default)(IkagakaApplication, null, [{
		key: 'start',
		value: function () {
			var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
				var idbfs, fs, path, buffer, nanikaStorage, namedManager, timerEventSource, namedKernelManager, ikagakaApplication, baseProfileStat, baseProfile, currentJsVersion;
				return _regenerator2.default.wrap(function _callee$(_context) {
					while (1) {
						switch (_context.prev = _context.next) {
							case 0:
								_context.next = 2;
								return new _promise2.default(function (resolve, reject) {
									return new BrowserFS.FileSystem.IndexedDB(function (error, idbfs) {
										return error ? reject(error) : resolve(idbfs);
									});
								});

							case 2:
								idbfs = _context.sent;

								BrowserFS.initialize(idbfs);
								fs = BrowserFS.BFSRequire('fs');
								path = BrowserFS.BFSRequire('path');
								buffer = BrowserFS.BFSRequire('buffer');

								promisify(fs);
								_context.prev = 8;
								_context.next = 11;
								return fs.mkdirPromise(ikagakaDir);

							case 11:
								_context.next = 15;
								break;

							case 13:
								_context.prev = 13;
								_context.t0 = _context['catch'](8);

							case 15:
								// errorをスルー

								nanikaStorage = new _nanikaStorage2.default(new _nanikaStorage2.default.Backend.FS(ikagakaDir, fs, path, buffer.Buffer));
								namedManager = new _cuttlebone2.default.NamedManager();
								timerEventSource = new _ukagakaTimerEventSource.TimerEventSource();
								namedKernelManager = new _namedKernelManager.NamedKernelManager({
									NamedManager: namedManager,
									NanikaStorage: nanikaStorage,
									TimerEventSource: timerEventSource
								});

								namedKernelManager.GhostViewClass = _cuttlebone2.default;
								ikagakaApplication = new IkagakaApplication(namedKernelManager);

								IkagakaApplication.current = ikagakaApplication;

								baseProfileStat = void 0;
								_context.prev = 23;
								_context.next = 26;
								return fs.statPromise(path.dirname(nanikaStorage.base_profile_path()));

							case 26:
								baseProfileStat = _context.sent;
								_context.next = 31;
								break;

							case 29:
								_context.prev = 29;
								_context.t1 = _context['catch'](23);

							case 31:
								// errorをスルー
								if (baseProfileStat && baseProfileStat.isFile()) {
									// TODO
									window.alert("互換性の無い変更が加わりました。\n動作のために古いファイルを削除します。");
									IkagakaApplication.current.deleteStorage();
								}
								// profile
								_context.next = 34;
								return nanikaStorage.base_profile();

							case 34:
								baseProfile = _context.sent;

								if (baseProfile.ghosts) {
									_context.next = 40;
									break;
								}

								baseProfile.ghosts = ['ikaga'];
								baseProfile.balloonname = 'origin';
								_context.next = 40;
								return nanikaStorage.base_profile(baseProfile);

							case 40:
								// デフォゴインストール
								currentJsVersion = void 0;
								_context.prev = 41;
								_context.next = 44;
								return fs.readFilePromise(jsVersionFile);

							case 44:
								currentJsVersion = _context.sent;
								_context.next = 49;
								break;

							case 47:
								_context.prev = 47;
								_context.t2 = _context['catch'](41);

							case 49:
								if (!(jsVersion !== currentJsVersion)) {
									_context.next = 59;
									break;
								}

								console.log(namedKernelManager.installNar);
								_context.next = 53;
								return namedKernelManager.installNar(initialGhostUrl);

							case 53:
								console.log("install default 4");
								_context.next = 56;
								return namedKernelManager.installNar(initialBalloonUrl);

							case 56:
								console.log("install default 5");
								_context.next = 59;
								return fs.writeFilePromise(jsVersionFile, jsVersion);

							case 59:

								$('#ikagaka_boot').click(function () {
									return IkagakaApplication.current.boot();
								});
								$('#ikagaka_close').click(function () {
									return IkagakaApplication.current.close();
								});
								$('#ikagaka_delete').click(function () {
									return IkagakaApplication.current.deleteStorage();
								});
								$(namedManager.element).appendTo("body");
								console.log("install default 6");
								IkagakaApplication.current.boot();

							case 65:
							case 'end':
								return _context.stop();
						}
					}
				}, _callee, this, [[8, 13], [23, 29], [41, 47]]);
			}));

			function start() {
				return _ref.apply(this, arguments);
			}

			return start;
		}()
	}]);

	function IkagakaApplication(namedKernelManager) {
		(0, _classCallCheck3.default)(this, IkagakaApplication);

		this.namedKernelManager = namedKernelManager;
	}

	(0, _createClass3.default)(IkagakaApplication, [{
		key: 'boot',
		value: function boot() {
			this.namedKernelManager.start();
			$('#ikagaka_boot').attr('disabled', true);
			$('#ikagaka_close').removeAttr('disabled');
		}
	}, {
		key: 'close',
		value: function close() {
			this.namedKernelManager.close();
		}
	}, {
		key: 'deleteStorage',
		value: function () {
			var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
				var nanikaStorage;
				return _regenerator2.default.wrap(function _callee2$(_context2) {
					while (1) {
						switch (_context2.prev = _context2.next) {
							case 0:
								nanikaStorage = this.namedKernelManager.components.NanikaStorage;

								if (!window.confirm('本当に削除しますか？')) {
									_context2.next = 8;
									break;
								}

								_context2.next = 4;
								return nanikaStorage.backend._rmAll(ikagakaDir);

							case 4:
								_context2.next = 6;
								return nanikaStorage.backend._unlink(jsVersionFile);

							case 6:
								window.onbeforeunload = function () {
									return 1;
								};
								location.reload();

							case 8:
							case 'end':
								return _context2.stop();
						}
					}
				}, _callee2, this);
			}));

			function deleteStorage() {
				return _ref2.apply(this, arguments);
			}

			return deleteStorage;
		}()
	}, {
		key: 'menu',
		value: function menu() {}
	}]);
	return IkagakaApplication;
}();

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
//# sourceMappingURL=ikagaka_application.js.map
