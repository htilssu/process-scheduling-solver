import swal from 'sweetalert';

export const invalidInputSwal = (text: string) => {
  swal({
    title: 'Dữ liệu nhập vào không hợp lệ',
    text, 
    icon: 'error'
  });
};