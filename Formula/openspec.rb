class Openspec < Formula
  desc "AI-native system for spec-driven development (yurychang fork)"
  homepage "https://github.com/yurychang/OpenSpec"
  license "MIT"
  head "https://github.com/yurychang/OpenSpec.git", branch: "main"

  depends_on "node"
  depends_on "pnpm" => :build

  def install
    system "pnpm", "install", "--frozen-lockfile"
    system "npm", "install", *std_npm_args
    bin.install_symlink libexec/"bin/openspec"
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/openspec --version") unless build.head?
    assert_match "Usage:", shell_output("#{bin}/openspec --help")
  end
end
