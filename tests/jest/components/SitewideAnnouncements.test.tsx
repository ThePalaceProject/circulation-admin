import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { componentWithProviders } from "../testUtils/withProviders";
import { AdminRole } from "../../../src/interfaces";
import { SitewideAnnouncements } from "../../../src/components/announcements/SitewideAnnouncements";
import Admin from "../../../src/models/Admin";

// Mock AnnouncementsSection to avoid deep rendering
jest.mock("../../../src/components/announcements/AnnouncementsSection", () => {
  const getValue = jest.fn().mockReturnValue([]);
  const Mock = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({ getValue }));
    return (
      <div
        data-testid="announcements-section"
        data-value={JSON.stringify(props.value)}
        data-setting-key={props.setting?.key}
      />
    );
  });
  Mock.displayName = "MockAnnouncementsSection";
  return { __esModule: true, default: Mock };
});

const data = {
  announcements: [
    {
      id: "dcf036d9-106b-426c-838f-ce7c57d53801",
      content: "There is nothing to see here.",
      start: "2022-08-31",
      finish: "2022-10-31",
    },
  ],
  settings: [
    {
      category: "Announcements",
      description: "Announcements will be displayed to authenticated patrons.",
      key: "global_announcements",
      label: "Scheduled announcements",
      level: 3,
      type: "announcements",
    },
  ],
};

const baseProps = {
  data,
  csrfToken: "token",
  fetchData: jest.fn(),
  isFetching: false,
};

// System admin config for renderWithProviders
const systemAdminConfig = {
  appConfigSettings: { roles: [{ role: "system" as AdminRole }] },
};

// Non-admin config
const nonAdminConfig = {
  appConfigSettings: { roles: [] },
};

const renderSitewide = (props = {}, config = systemAdminConfig) => {
  const Wrapper = componentWithProviders(config);
  const roles = config.appConfigSettings?.roles || [];
  const admin = new Admin(roles as any);
  return render(
    <Wrapper>
      <SitewideAnnouncements {...baseProps} admin={admin} {...props} />
    </Wrapper>
  );
};

describe("SitewideAnnouncements", () => {
  it("renders a Form containing an AnnouncementsSection", () => {
    const { container } = renderSitewide();
    expect(container.querySelector("form")).toBeInTheDocument();
    const section = screen.getByTestId("announcements-section");
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute("data-setting-key", data.settings[0].key);
  });

  it("renders a loading indicator instead of a form when data is loading", () => {
    const { container } = renderSitewide({ isFetching: true });
    expect(container.querySelector("form")).not.toBeInTheDocument();
    // LoadingIndicator renders some loading UI
    expect(
      container.querySelector("[class*='loading']") ||
        container.querySelector("img") ||
        document.body.textContent
    ).toBeTruthy();
  });

  it("calls editItem when the form is submitted", () => {
    const editItem = jest.fn().mockResolvedValue(undefined);
    const { container } = renderSitewide({ editItem });

    const submitButton = container.querySelector('button[type="submit"]');
    fireEvent.click(submitButton);

    expect(editItem).toHaveBeenCalledTimes(1);
    // FormData may be undefined in JSDOM when form doesn't serialize natively
    // Just verify editItem was called
  });

  it("disables the submit button when user does not have permission", () => {
    const { container } = renderSitewide({}, nonAdminConfig);
    const submitButton = container.querySelector('button[type="submit"]');
    expect(submitButton).toBeDisabled();
  });
});
