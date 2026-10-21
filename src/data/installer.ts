// Mirrors crates/fspec-install/src/catalog.rs and spec.rs in formalspec (branch installer).
// Keep both in step with the Rust source: the hero claims this is the installer's real output.

export type Preset = 'minimal' | 'desktop' | 'gaming' | 'server';
export type Desktop = 'gnome' | 'kde';

export interface Distro {
  id: string;
  name: string;
  reason: string;
  release: 'fixed' | 'rolling';
  delivery: 'classic' | 'image';
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
];

export const PRESET_LABELS: Record<Preset, string> = {
  minimal: 'Minimal',
  desktop: 'Desktop',
  gaming: 'Gaming',
  server: 'Server',
};

export const DESKTOP_LABELS: Record<Desktop, string> = { gnome: 'GNOME', kde: 'KDE' };

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

// spec.rs preview(), line for line. The installer only writes the account when both names are set.
export function preview(d: Draft): string {
  let out = '# Written by the FormalSpec installer. Edit it, then run `fspec apply`.\n';
  out += `load("//modules/${d.preset}.star", "${d.preset}")\n`;
  out += '\nhosts = [\n    host(\n';
  const hasAccount = Boolean(d.hostname && d.user);
  out += `        name = "${hasAccount ? d.hostname : '…'}",\n        platform = "x86_64-linux",\n`;
  const args = d.desktop ? `, desktop = "${d.desktop}"` : '';
  out += `        modules = [${d.preset}("${d.distro}"${args})],\n`;
  if (hasAccount) {
    out += `        users = [user("${d.user}", uid = 1000, groups = ["wheel"])],\n`;
  }
  out += '        protect = ["/home"],\n    ),\n]\n';
  return out;
}
