// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import DashboardLayout from "./layout";

import { getCurrentSession } from "@/lib/auth/session";
import { getSampleMetadata } from "@/lib/sample-metadata/server";
import { getSampleCreateMetadataAction } from "./samples/actions";

const { sampleCreateOverlayBridge } = vi.hoisted(() => ({
  sampleCreateOverlayBridge: vi.fn(() => <div>Global thêm mẫu</div>),
}));

const { topbar } = vi.hoisted(() => ({
  topbar: vi.fn(() => <div>Topbar</div>),
}));

vi.mock("next/server", () => ({
  connection: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/components/layout/topbar", () => ({
  Topbar: topbar,
}));

vi.mock("@/components/layout/bottom-nav", () => ({
  BottomNav: () => <div>BottomNav</div>,
}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/sample-metadata/server", () => ({
  getSampleMetadata: vi.fn(),
}));

vi.mock("./samples/actions", () => ({
  createSampleMetadataAction: vi.fn(),
  getSampleCreateMetadataAction: vi.fn(),
  updateSampleMetadataAction: vi.fn(),
}));

vi.mock("./samples/_components/sample-create-overlay-bridge", () => ({
  SampleCreateOverlayBridge: sampleCreateOverlayBridge,
}));

const session = {
  profile: {
    displayName: "Quản trị viên",
    id: "profile-1",
    email: "admin@example.test",
    username: "admin",
  },
  memberships: [
    {
      organizationId: "org-1",
      role: "admin",
      isActive: true,
    },
  ],
};

const viewerSession = {
  profile: {
    displayName: "Người xem",
    id: "profile-2",
    email: "viewer@example.test",
    username: "viewer",
  },
  memberships: [
    {
      organizationId: "org-1",
      role: "viewer",
      isActive: true,
    },
  ],
};

const metadata = {
  companies: [],
  customers: [],
  filterOptions: {
    billingStatuses: [],
    companies: [],
    sampleTypes: [],
  },
  kitBatches: [],
  resultGroupOptions: [],
  sampleTypes: [],
  samples: [],
  summary: {
    inProgressSamples: 0,
    receivedSamples: 0,
    totalSamples: 0,
    unpaidSamples: 0,
  },
};

describe("DashboardLayout", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test("reserves enough mobile bottom padding for the taller bottom nav", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(session as never);

    const { container } = render(
      await DashboardLayout({ children: <div>Trang con</div> })
    );

    expect(container.firstElementChild?.className).toContain("pb-[4.5rem]");
  });

  test("mounts the sample-create bridge without full metadata for every writable dashboard route", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(session as never);
    vi.mocked(getSampleMetadata).mockResolvedValue(metadata);

    render(await DashboardLayout({ children: <div>Trang con</div> }));

    expect(getSampleMetadata).not.toHaveBeenCalled();
    expect(topbar).toHaveBeenCalledWith(
      expect.objectContaining({ canCreateSamples: true }),
      undefined
    );
    expect(sampleCreateOverlayBridge).toHaveBeenCalledTimes(1);
    expect(sampleCreateOverlayBridge).toHaveBeenCalledWith(
      expect.objectContaining({
        initialMetadata: null,
        loadMetadata: getSampleCreateMetadataAction,
      }),
      undefined
    );
    expect(screen.getByText("Global thêm mẫu")).toBeTruthy();
    expect(screen.getByText("Trang con")).toBeTruthy();
  });

  test("skips sample-create metadata for viewer sessions", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(viewerSession as never);
    vi.mocked(getSampleMetadata).mockResolvedValue(metadata);

    render(await DashboardLayout({ children: <div>Trang con</div> }));

    expect(getSampleMetadata).not.toHaveBeenCalled();
    expect(topbar).toHaveBeenCalledWith(
      expect.objectContaining({ canCreateSamples: false }),
      undefined
    );
    expect(sampleCreateOverlayBridge).not.toHaveBeenCalled();
    expect(screen.queryByText("Global thêm mẫu")).toBeNull();
    expect(screen.getByText("Trang con")).toBeTruthy();
  });
});
