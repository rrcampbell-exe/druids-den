import coelbrenify from '../utils/coelbrenify'

const Coelbren = ({ children, renderAs: Tag = 'p', ...props }) =>
  <Tag {...props}>{coelbrenify(children)}</Tag>

export default Coelbren
