import { it, expect, vi, beforeEach } from "vitest";

const coreMock = {
  getInput: vi.fn(),
  notice: vi.fn(),
  setOutput: vi.fn(),
  setFailed: vi.fn(),
};

const paginateMock = vi.fn();
const createRefMock = vi.fn();

const octokitMock = {
  paginate: paginateMock,
  rest: {
    git: {
      listMatchingRefs: vi.fn(),
      createRef: createRefMock,
    },
  },
};

const githubMock = {
  getOctokit: vi.fn(() => octokitMock),
  context: {
    repo: { owner: "test-owner", repo: "test-repo" },
    sha: "abc123",
  },
};

vi.mock("@actions/core", () => coreMock);
vi.mock("@actions/github", () => githubMock);

function ref(tag: string) {
  return { ref: `refs/tags/${tag}` };
}

async function runAction() {
  vi.resetModules();
  await import("./main.js");
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.GITHUB_TOKEN = "fake-token";
  coreMock.getInput.mockReturnValue("1");
  paginateMock.mockResolvedValue([]);
  createRefMock.mockResolvedValue({});
});

it("creates tag 1.1.1 when no existing tags", async () => {
  await runAction();

  expect(createRefMock).toHaveBeenCalledWith({
    owner: "test-owner",
    repo: "test-repo",
    ref: "refs/tags/1.1.1",
    sha: "abc123",
  });
});

it("increments minor version from highest existing tag", async () => {
  paginateMock.mockResolvedValue([ref("1.1.1"), ref("1.3.1"), ref("1.2.1")]);

  await runAction();

  expect(createRefMock).toHaveBeenCalledWith(
    expect.objectContaining({ ref: "refs/tags/1.4.1" }),
  );
});

it("uses the provided major version input", async () => {
  coreMock.getInput.mockReturnValue("3");
  paginateMock.mockResolvedValue([ref("3.5.1")]);

  await runAction();

  expect(paginateMock).toHaveBeenCalledWith(
    octokitMock.rest.git.listMatchingRefs,
    expect.objectContaining({ ref: "tags/3." }),
  );
  expect(createRefMock).toHaveBeenCalledWith(
    expect.objectContaining({ ref: "refs/tags/3.6.1" }),
  );
});

it("skips tags with mismatched patch version when finding highest minor", async () => {
  paginateMock.mockResolvedValue([
    ref("1.10.2"), // skipped: patch is 2, not 1
    ref("1.5.1"), // matched: only tag with patch 1
    ref("1.8.99"), // skipped: patch is 99, not 1
  ]);

  await runAction();

  expect(createRefMock).toHaveBeenCalledWith(
    expect.objectContaining({ ref: "refs/tags/1.6.1" }),
  );
});

it("increments from highest minor even when there are gaps in tag sequence", async () => {
  paginateMock.mockResolvedValue([ref("1.1.1"), ref("1.5.1"), ref("1.10.1")]);

  await runAction();

  expect(createRefMock).toHaveBeenCalledWith(
    expect.objectContaining({ ref: "refs/tags/1.11.1" }),
  );
});

it("skips tags with wrong number of version parts", async () => {
  paginateMock.mockResolvedValue([
    ref("1.7"), // only 2 parts
    ref("1.9.1.0"), // 4 parts
    ref("1.3.1"), // valid
  ]);

  await runAction();

  expect(createRefMock).toHaveBeenCalledWith(
    expect.objectContaining({ ref: "refs/tags/1.4.1" }),
  );
});

it("fails when GITHUB_TOKEN is not set", async () => {
  delete process.env.GITHUB_TOKEN;

  await runAction();

  expect(coreMock.setFailed).toHaveBeenCalledWith(
    "GITHUB_TOKEN environment variable is required",
  );
  expect(createRefMock).not.toHaveBeenCalled();
});
