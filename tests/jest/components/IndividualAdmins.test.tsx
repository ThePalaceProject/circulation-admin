import * as React from "react";
import * as PropTypes from "prop-types";
import { renderWithProviders } from "../testUtils/withProviders";
import { screen } from "@testing-library/react";
import { IndividualAdmins } from "../../../src/components/config/IndividualAdmins";

// IndividualAdmins reads admin from legacy context
class AdminContextProvider extends React.Component<{
  children: React.ReactNode;
  isSystemAdmin?: boolean;
  isLibraryManager?: boolean;
}> {
  static childContextTypes = {
    admin: PropTypes.object.isRequired,
  };
  getChildContext() {
    const { isSystemAdmin = false, isLibraryManager = false } = this.props;
    return {
      admin: {
        isSystemAdmin: () => isSystemAdmin,
        isLibraryManagerOfSomeLibrary: () => isLibraryManager,
        isSitewideLibraryManager: () => isLibraryManager,
      },
    };
  }
  render() {
    return <>{this.props.children}</>;
  }
}

const defaultProps = {
  settingUp: true,
  editOrCreate: "create" as const,
  csrfToken: "token",
};

function renderAdmins(
  props = defaultProps,
  adminContext?: { isSystemAdmin?: boolean; isLibraryManager?: boolean }
) {
  return renderWithProviders(
    <AdminContextProvider {...adminContext}>
      <IndividualAdmins {...props} />
    </AdminContextProvider>
  );
}

describe("IndividualAdmins", () => {
  it("shows welcome message when setting up", () => {
    renderAdmins();
    expect(
      screen.getByRole("heading", { name: "Welcome!" })
    ).toBeInTheDocument();
  });

  it("shows setup account message when setting up", () => {
    renderAdmins();
    expect(
      screen.getByRole("heading", { name: "Set up your system admin account" })
    ).toBeInTheDocument();
  });

  it("shows individual admin configuration heading when not setting up", () => {
    renderAdmins({ ...defaultProps, settingUp: false });
    expect(
      screen.getByRole("heading", { name: /Individual admin configuration/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Create a new individual admin/i })
    ).toBeInTheDocument();
  });
});
