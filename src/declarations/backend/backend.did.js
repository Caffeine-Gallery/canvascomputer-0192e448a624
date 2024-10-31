export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'getLastDrawing' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'saveDrawing' : IDL.Func([IDL.Text], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
