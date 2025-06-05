import coelbrenify from '../utils/coelbrenify'

const Coelbren = ({ text, renderAs: Tag = 'p', ...props }) =>
  <Tag {...props}>{coelbrenify(text)}</Tag>

export default Coelbren
