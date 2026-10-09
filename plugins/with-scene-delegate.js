// Minimal UIScene lifecycle for iOS 27, which traps at launch
// (_UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption) in apps that
// never adopt it. Unrelated to the bug this project reproduces; it only lets
// the app start. Moves window creation from the Expo AppDelegate template into
// a SceneDelegate.
const { withAppDelegate, withInfoPlist } = require("@expo/config-plugins");

const MANUAL_WINDOW_BLOCK = `
#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif
`;

const CONFIGURATION_METHOD = `
  public func application(
    _ application: UIApplication,
    configurationForConnecting connectingSceneSession: UISceneSession,
    options: UIScene.ConnectionOptions
  ) -> UISceneConfiguration {
    let configuration = UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    configuration.delegateClass = SceneDelegate.self
    return configuration
  }
`;

const SCENE_DELEGATE = `
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          let factory = appDelegate.reactNativeFactory else { return }
    let window = UIWindow(windowScene: windowScene)
    factory.startReactNative(withModuleName: "main", in: window, launchOptions: nil)
    self.window = window
    appDelegate.window = window
  }
}
`;

module.exports = function withSceneDelegate(config) {
  config = withAppDelegate(config, (config) => {
    let contents = config.modResults.contents;
    if (contents.includes("class SceneDelegate")) return config;
    if (!contents.includes(MANUAL_WINDOW_BLOCK)) {
      throw new Error("with-scene-delegate: Expo's AppDelegate template changed; update MANUAL_WINDOW_BLOCK.");
    }
    contents = contents
      .replace(MANUAL_WINDOW_BLOCK, "\n")
      .replace(/class AppDelegate: ExpoAppDelegate \{\n/, (match) => match + CONFIGURATION_METHOD)
      .replace(/class ReactNativeDelegate: ExpoReactNativeFactoryDelegate \{/, (match) => SCENE_DELEGATE + "\n" + match);
    config.modResults.contents = contents;
    return config;
  });

  return withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Default Configuration",
            UISceneDelegateClassName: "$(PRODUCT_MODULE_NAME).SceneDelegate",
          },
        ],
      },
    };
    return config;
  });
};
