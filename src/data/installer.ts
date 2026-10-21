// Mirrors crates/fspec-install/src/catalog.rs, model.rs and spec.rs in formalspec (branch installer).
// Keep both in step with the Rust source: the hero claims this is the installer's real output.

export type Preset = 'minimal' | 'desktop' | 'gaming' | 'server';
export type Desktop = 'gnome' | 'kde' | 'cosmic';

export interface Distro {
  id: string;
  name: string;
  reason: string;
  release: 'fixed' | 'rolling';
  delivery: 'classic' | 'image' | 'atomic';
  prerelease?: string;
  snapper?: boolean;
  signedKernel: boolean;
  presets: Preset[];
  desktops: Desktop[];
}

const ALL: Preset[] = ['minimal', 'desktop', 'gaming', 'server'];

export const DISTROS: Distro[] = [
  { id: 'fedora', name: 'Fedora', reason: 'Current software every six months, with a signed kernel that Secure Boot and anti-cheat trust.', release: 'fixed', delivery: 'classic', signedKernel: true, presets: ALL, desktops: ['gnome', 'kde'] },
  { id: 'bazzite', name: 'Bazzite', reason: 'A gaming image built on Fedora, with Steam, HDR and handheld support ready on first boot.', release: 'fixed', delivery: 'image', signedKernel: true, presets: ['desktop', 'gaming'], desktops: ['kde', 'gnome'] },
  { id: 'fedora-atomic', name: 'Fedora Atomic', reason: 'Fedora as an image: updates land whole and the previous one stays in the boot menu.', release: 'fixed', delivery: 'image', signedKernel: true, presets: ['desktop'], desktops: ['gnome', 'kde'] },
  { id: 'aurora', name: 'Aurora', reason: 'A KDE image from Universal Blue, tuned for daily work and development.', release: 'fixed', delivery: 'image', signedKernel: true, presets: ['desktop'], desktops: ['kde'] },
  { id: 'arch', name: 'Arch Linux', reason: 'The newest packages the week they ship, and only what you ask for.', release: 'rolling', delivery: 'classic', signedKernel: false, presets: ALL, desktops: ['kde', 'gnome'] },
  { id: 'cachyos', name: 'CachyOS', reason: 'Arch with packages built for current CPUs and a kernel tuned for desktops and games.', release: 'rolling', delivery: 'classic', signedKernel: false, presets: ALL, desktops: ['kde', 'gnome'] },
  { id: 'ubuntu', name: 'Ubuntu', reason: 'Long-term support and the broadest hardware and vendor support.', release: 'fixed', delivery: 'classic', signedKernel: true, presets: ALL, desktops: ['gnome', 'kde'] },
  { id: 'debian', name: 'Debian', reason: 'Stable for years at a time. Nothing changes until you decide to upgrade.', release: 'fixed', delivery: 'classic', signedKernel: true, presets: ALL, desktops: ['gnome', 'kde'] },
  { id: 'void', name: 'Void Linux', reason: 'An independent rolling distro with runit and a package manager that stays out of the way.', release: 'rolling', delivery: 'classic', signedKernel: false, presets: ALL, desktops: ['kde', 'gnome'] },
  { id: 'void-musl', name: 'Void Linux (musl)', reason: 'Void built on musl instead of glibc: smaller and simpler, but some prebuilt apps will not run.', release: 'rolling', delivery: 'classic', signedKernel: false, presets: ['minimal', 'desktop', 'server'], desktops: ['kde', 'gnome'] },
  { id: 'opensuse-tumbleweed', name: 'openSUSE Tumbleweed', reason: 'Rolling, but every update is tested together before it ships, and you can roll back to an earlier state.', release: 'rolling', delivery: 'classic', signedKernel: true, snapper: true, presets: ALL, desktops: ['kde', 'gnome'] },
  { id: 'opensuse-leap', name: 'openSUSE Leap', reason: "Built from SUSE Linux Enterprise's sources, with each release supported for 24 months.", release: 'fixed', delivery: 'classic', signedKernel: true, snapper: true, presets: ['minimal', 'desktop', 'server'], desktops: ['gnome', 'kde'] },
  { id: 'aeon', name: 'openSUSE Aeon', reason: 'A GNOME desktop that updates itself daily in the background, with apps from Flatpak and tools in Distrobox.', release: 'rolling', delivery: 'atomic', signedKernel: true, snapper: true, prerelease: 'RC', presets: ['desktop'], desktops: ['gnome'] },
  { id: 'kalpa-desktop', name: 'openSUSE Kalpa', reason: "Aeon's approach with KDE Plasma: automatic transactional updates, apps from Flatpak and Distrobox.", release: 'rolling', delivery: 'atomic', signedKernel: true, snapper: true, prerelease: 'alpha', presets: ['desktop'], desktops: ['kde'] },
  { id: 'aerynos', name: 'AerynOS', reason: 'Built from scratch by its own tooling. Moss switches each update in atomically, and you can boot back into an earlier state.', release: 'rolling', delivery: 'atomic', signedKernel: false, prerelease: 'alpha', presets: ['desktop'], desktops: ['gnome', 'kde', 'cosmic'] },
];

export const PRESET_LABELS: Record<Preset, string> = {
  minimal: 'Minimal',
  desktop: 'Desktop',
  gaming: 'Gaming',
  server: 'Server',
};

export const DESKTOP_LABELS: Record<Desktop, string> = { gnome: 'GNOME', kde: 'KDE Plasma', cosmic: 'COSMIC' };

export function needsDesktop(preset: Preset) {
  return preset === 'desktop' || preset === 'gaming';
}

export interface Draft {
  distro: string;
  preset: Preset;
  desktop?: Desktop;
  hostname?: string;
  user?: string;
}

// spec.rs preview(), line for line. The hero has no locale step, so those lines stay out, as they do
// in the installer before you reach it. The account lines appear once both names are set.
export function preview(d: Draft): string {
  let out = "# This machine's spec. `fspec plan` shows what a change would do, `fspec apply` makes it so.\n";
  out += `load("//modules/${d.preset}.star", "modules", "system")\n`;
  out += '\nhosts = [\n    host(\n';
  const hasAccount = Boolean(d.hostname && d.user);
  if (hasAccount) out += `        name = "${d.hostname}",\n`;
  out += '        platform = "x86_64-linux",\n';
  const args = d.desktop ? `, desktop = "${d.desktop}"` : '';
  out += `        system = system("${d.distro}"${args}),\n        modules = modules("${d.distro}"${args}),\n`;
  if (hasAccount) {
    const group = d.distro === 'debian' || d.distro === 'ubuntu' ? 'sudo' : 'wheel';
    out += `        users = [user("${d.user}", uid = 1000, groups = ["${group}"])],\n`;
  }
  out += '        protect = ["/home"],\n    ),\n]\n';
  return out;
}
