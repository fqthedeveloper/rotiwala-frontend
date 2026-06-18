import Swal from "sweetalert2";

export const successAlert = (
  title,
  message
) => {
  Swal.fire({
    icon: "success",
    title,
    text: message,
  });
};

export const errorAlert = (
  title,
  message
) => {
  Swal.fire({
    icon: "error",
    title,
    text: message,
  });
};

export const logoutConfirm =
  () => {

    return Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Logout",
    });

  };